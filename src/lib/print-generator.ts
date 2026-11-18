import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import Papa from 'papaparse';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { fitVariableTextToBox } from '@/lib/fitting';
import { OrderRecord, ProductDivision } from '@/types/database';

const MM_TO_PT = 2.83465;

interface CanvasElementSpec {
  id: string;
  type: 'text' | 'image';
  content: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  fontSizePt: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  laserRole?: 'ENGRAVE' | 'CUT';
}

function hexToRgbNormalized(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || '#141413').replace('#', '');
  const num = parseInt(clean.length === 6 ? clean : '141413', 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function resolvePlaceholders(
  rawText: string,
  row: Record<string, string> | null,
  boxWidthMm: number,
  boxHeightMm: number,
  maxFontSizePt: number,
  isBold: boolean
): { text: string; fontSizePt: number } {
  if (!row) {
    return { text: rawText, fontSizePt: maxFontSizePt };
  }

  const substituted = rawText.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const matchedKey = Object.keys(row).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    return matchedKey ? String(row[matchedKey] ?? '') : '';
  });

  const fitted = fitVariableTextToBox(substituted, {
    fieldKey: rawText,
    boxWidthMm,
    boxHeightMm,
    maxFontSizePt,
    minFontSizePt: 6,
    defaultTrackingEm: 0,
    minTrackingEm: -0.04,
    fontWeight: isBold ? 'bold' : 'normal',
  });

  return {
    text: fitted.text,
    fontSizePt: fitted.fittedFontSizePt,
  };
}

async function renderSinglePrintUnit(params: {
  order: OrderRecord;
  division: ProductDivision;
  row: Record<string, string> | null;
  unitLabel: string;
}): Promise<{ pdfBytes: Uint8Array; pngBytes: Buffer }> {
  const { order, division, row } = params;
  const trimW = Number(order.width_mm);
  const trimH = Number(order.height_mm);
  const bleed = Number(division.bleed_mm);
  const totalW = trimW + bleed * 2;
  const totalH = trimH + bleed * 2;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([totalW * MM_TO_PT, totalH * MM_TO_PT]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const canvasData = (order.canvas_json ?? {}) as {
    backgroundColor?: string;
    elements?: CanvasElementSpec[];
  };

  // Fill background across full bleed area
  const bg = division.monochrome_preview
    ? { r: 1, g: 1, b: 1 }
    : hexToRgbNormalized(canvasData.backgroundColor ?? '#FFFFFF');

  page.drawRectangle({
    x: 0,
    y: 0,
    width: totalW * MM_TO_PT,
    height: totalH * MM_TO_PT,
    color: rgb(bg.r, bg.g, bg.b),
  });

  // Draw corner crop marks when bleed > 0
  if (bleed > 0) {
    const markLen = Math.min(bleed * 0.8, 2.5) * MM_TO_PT;
    const bPt = bleed * MM_TO_PT;
    const wPt = totalW * MM_TO_PT;
    const hPt = totalH * MM_TO_PT;
    const cropColor = rgb(0.08, 0.08, 0.08);

    // Bottom-left
    page.drawLine({ start: { x: 0, y: bPt }, end: { x: markLen, y: bPt }, thickness: 0.5, color: cropColor });
    page.drawLine({ start: { x: bPt, y: 0 }, end: { x: bPt, y: markLen }, thickness: 0.5, color: cropColor });
    // Top-right
    page.drawLine({ start: { x: wPt - markLen, y: hPt - bPt }, end: { x: wPt, y: hPt - bPt }, thickness: 0.5, color: cropColor });
    page.drawLine({ start: { x: wPt - bPt, y: hPt - markLen }, end: { x: wPt - bPt, y: hPt }, thickness: 0.5, color: cropColor });
  }

  // Render canvas elements
  const elements = Array.isArray(canvasData.elements) ? canvasData.elements : [];
  for (const el of elements) {
    if (el.type === 'text') {
      const isBold = el.fontWeight === 'bold';
      const resolved = resolvePlaceholders(
        el.content,
        row,
        el.widthMm,
        el.heightMm,
        el.fontSizePt,
        isBold
      );

      const inkColor = division.monochrome_preview
        ? { r: 0, g: 0, b: 0 }
        : division.layer_mode === 'CUT_ENGRAVE' && el.laserRole === 'CUT'
        ? { r: 0.86, g: 0.15, b: 0.15 }
        : hexToRgbNormalized(el.color);

      const xPt = (bleed + el.xMm) * MM_TO_PT;
      // PDF coordinate origin is bottom-left
      const yPt = (totalH - (bleed + el.yMm + el.heightMm * 0.72)) * MM_TO_PT;

      page.drawText(resolved.text, {
        x: xPt,
        y: yPt,
        size: resolved.fontSizePt,
        font: isBold ? fontBold : fontRegular,
        color: rgb(inkColor.r, inkColor.g, inkColor.b),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();

  // Render crisp 300/600 DPI raster PNG specimen via SVG -> sharp
  const dpi = division.output_dpi || 300;
  const pxPerMm = dpi / 25.4;
  const pxW = Math.max(100, Math.round(totalW * pxPerMm));
  const pxH = Math.max(100, Math.round(totalH * pxPerMm));

  const svgTexts = elements
    .filter((el) => el.type === 'text')
    .map((el) => {
      const isBold = el.fontWeight === 'bold';
      const resolved = resolvePlaceholders(
        el.content,
        row,
        el.widthMm,
        el.heightMm,
        el.fontSizePt,
        isBold
      );
      const fill = division.monochrome_preview
        ? '#000000'
        : division.layer_mode === 'CUT_ENGRAVE' && el.laserRole === 'CUT'
        ? '#DC2626'
        : el.color || '#141413';

      const cx = (bleed + el.xMm + el.widthMm / 2) * pxPerMm;
      const cy = (bleed + el.yMm + el.heightMm * 0.65) * pxPerMm;
      const fontPx = resolved.fontSizePt * 0.352778 * pxPerMm;
      const safeStr = resolved.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="${
        isBold ? 'bold' : 'normal'
      }" font-size="${fontPx}px" fill="${fill}">${safeStr}</text>`;
    })
    .join('\n');

  const bgHex = division.monochrome_preview
    ? '#FFFFFF'
    : canvasData.backgroundColor ?? '#FFFFFF';

  const svgBuffer = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}">
      <rect width="100%" height="100%" fill="${bgHex}" />
      ${svgTexts}
    </svg>
  `);

  let pipeline = sharp(svgBuffer).withMetadata({ density: dpi });
  if (division.monochrome_preview) {
    pipeline = pipeline.grayscale().threshold(128);
  }
  const pngBytes = await pipeline.png().toBuffer();

  return { pdfBytes, pngBytes };
}

/**
 * Generates high-resolution press-ready files ONLY after strict proof_approved === true.
 */
export async function generateApprovedProductionFiles(orderId: string) {
  const adminDb = createAdminSupabaseClient();

  const { data: order, error: orderErr } = await adminDb
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    throw new Error('Order not found');
  }

  // STRICT PROOF APPROVAL GATE ENFORCEMENT
  if (!order.proof_approved) {
    throw new Error(
      'PRODUCTION LOCKED: High-resolution production files cannot be generated until the customer approves a digital proof.'
    );
  }

  const { data: division } = await adminDb
    .from('product_divisions')
    .select('*')
    .eq('id', order.division_id)
    .single();

  if (!division) {
    throw new Error('Product division configuration missing');
  }

  const folderName = `${order.order_number}_${order.division_slug}`;
  const manifest: Array<{
    rowIndex?: number;
    label: string;
    pdfPath: string;
    pngPath: string;
  }> = [];

  // Parse CSV rows if attached
  let csvRows: Record<string, string>[] = [];
  if (order.csv_storage_path && !order.csv_storage_path.startsWith('inline/')) {
    const { data: csvBlob } = await adminDb.storage
      .from('customer-artwork')
      .download(order.csv_storage_path);

    if (csvBlob) {
      const csvText = await csvBlob.text();
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      csvRows = parsed.data ?? [];
    }
  }

  if (csvRows.length > 0) {
    // Generate individual print-ready PDF & PNG for every CSV row (capped at 250 per synchronous run)
    const batch = csvRows.slice(0, 250);
    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const firstVal = String(Object.values(row)[0] ?? i + 1).replace(/[^a-zA-Z0-9_-]/g, '');
      const unitLabel = `row_${String(i + 1).padStart(4, '0')}_${firstVal}`;

      const { pdfBytes, pngBytes } = await renderSinglePrintUnit({
        order: order as OrderRecord,
        division: division as ProductDivision,
        row,
        unitLabel,
      });

      const pdfPath = `${folderName}/${unitLabel}_${division.output_dpi}dpi.pdf`;
      const pngPath = `${folderName}/${unitLabel}_${division.output_dpi}dpi.png`;

      await Promise.all([
        adminDb.storage.from('production-files').upload(pdfPath, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true,
        }),
        adminDb.storage.from('production-files').upload(pngPath, pngBytes, {
          contentType: 'image/png',
          upsert: true,
        }),
      ]);

      manifest.push({
        rowIndex: i + 1,
        label: unitLabel,
        pdfPath,
        pngPath,
      });
    }
  } else {
    // Single master press-ready PDF & PNG
    const unitLabel = `master_${order.width_mm}x${order.height_mm}mm`;
    const { pdfBytes, pngBytes } = await renderSinglePrintUnit({
      order: order as OrderRecord,
      division: division as ProductDivision,
      row: null,
      unitLabel,
    });

    const pdfPath = `${folderName}/${unitLabel}_${division.output_dpi}dpi.pdf`;
    const pngPath = `${folderName}/${unitLabel}_${division.output_dpi}dpi.png`;

    await Promise.all([
      adminDb.storage.from('production-files').upload(pdfPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      }),
      adminDb.storage.from('production-files').upload(pngPath, pngBytes, {
        contentType: 'image/png',
        upsert: true,
      }),
    ]);

    manifest.push({
      label: unitLabel,
      pdfPath,
      pngPath,
    });
  }

  await adminDb
    .from('orders')
    .update({
      production_folder_name: folderName,
      production_files_generated: true,
      production_manifest: manifest,
      stage: 'PRODUCTION',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  return { folderName, filesCount: manifest.length, manifest };
}