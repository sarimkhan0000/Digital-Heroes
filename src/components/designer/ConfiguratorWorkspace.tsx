'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookmarkCheck,
  CreditCard,
  FileUp,
  PenTool,
  RotateCw,
} from 'lucide-react';
import { DivisionMaterial, ProductDivision } from '@/types/database';
import { calculateProductPrice } from '@/lib/pricing';
import { createClient } from '@/lib/supabase/client';
import {
  CanvasDesignPayload,
  PrintCanvasEditor,
} from '@/components/designer/PrintCanvasEditor';
import { ArtworkUploader } from '@/components/designer/ArtworkUploader';
import { CsvMergeUploader } from '@/components/designer/CsvMergeUploader';

interface ConfiguratorWorkspaceProps {
  division: ProductDivision;
  materials: DivisionMaterial[];
  initialWidth?: number;
  initialHeight?: number;
  initialQuantity?: number;
  initialMaterialId?: string;
}

export function ConfiguratorWorkspace({
  division,
  materials,
  initialWidth,
  initialHeight,
  initialQuantity,
  initialMaterialId,
}: ConfiguratorWorkspaceProps) {
  const router = useRouter();

  const [materialId, setMaterialId] = useState<string>(
    initialMaterialId && materials.some((m) => m.id === initialMaterialId)
      ? initialMaterialId
      : materials[0]?.id ?? ''
  );
  const [widthMm, setWidthMm] = useState<number>(
    initialWidth || Number(division.default_width_mm)
  );
  const [heightMm, setHeightMm] = useState<number>(
    initialHeight || Number(division.default_height_mm)
  );
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    widthMm >= heightMm ? 'landscape' : 'portrait'
  );
  const [quantity, setQuantity] = useState<number>(
    Math.max(division.min_quantity, initialQuantity || Math.max(division.min_quantity, 50))
  );

  const [artworkMode, setArtworkMode] = useState<'CANVAS_DESIGN' | 'UPLOADED_FILE'>(
    'CANVAS_DESIGN'
  );
  const [canvasPayload, setCanvasPayload] = useState<CanvasDesignPayload | null>(null);
  const [uploadedArtworkPath, setUploadedArtworkPath] = useState<string | null>(null);

  const [csvPath, setCsvPath] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvPreviewRow, setCsvPreviewRow] = useState<Record<string, string> | null>(null);

  const [designTitle, setDesignTitle] = useState<string>(`${division.name} — Custom Run`);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [savingDesign, setSavingDesign] = useState<boolean>(false);
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeMaterial =
    materials.find((m) => m.id === materialId) ?? materials[0];

  const effectiveQuantity =
    division.supports_csv_merge && csvRows.length > 0
      ? Math.max(division.min_quantity, csvRows.length)
      : quantity;

  const pricing = useMemo(() => {
    return calculateProductPrice({
      widthMm,
      heightMm,
      minWidthMm: Number(division.min_width_mm),
      maxWidthMm: Number(division.max_width_mm),
      minHeightMm: Number(division.min_height_mm),
      maxHeightMm: Number(division.max_height_mm),
      quantity: effectiveQuantity,
      minQuantity: division.min_quantity,
      baseSetupFee: Number(division.base_setup_fee),
      baseRatePerSqCm: Number(division.base_rate_per_sq_cm),
      materialMultiplier: Number(activeMaterial?.price_multiplier ?? 1),
    });
  }, [division, activeMaterial, widthMm, heightMm, effectiveQuantity]);

  const handleSwapOrientation = () => {
    setWidthMm(heightMm);
    setHeightMm(widthMm);
    setOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'));
  };

  const handleSaveDesign = async () => {
    setSavingDesign(true);
    setStatusMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/configure/${division.slug}`);
      return;
    }

    const { error } = await supabase.from('saved_designs').insert({
      user_id: user.id,
      division_id: division.id,
      material_id: activeMaterial.id,
      title: designTitle.trim() || `${division.name} Configuration`,
      width_mm: widthMm,
      height_mm: heightMm,
      orientation,
      quantity: effectiveQuantity,
      source_type: artworkMode,
      canvas_json: artworkMode === 'CANVAS_DESIGN' ? canvasPayload : null,
      uploaded_artwork_path: artworkMode === 'UPLOADED_FILE' ? uploadedArtworkPath : null,
      csv_storage_path: csvPath,
    });

    setSavingDesign(false);
    if (error) {
      setStatusMessage(`Error saving design: ${error.message}`);
    } else {
      setStatusMessage('Design & configuration saved to your account for one-click reorder.');
    }
  };

  const handleCheckout = async () => {
    if (!pricing.isValid) return;
    if (artworkMode === 'UPLOADED_FILE' && !uploadedArtworkPath) {
      setStatusMessage('Please upload your artwork file (PDF, SVG, AI, or PNG) before checkout.');
      return;
    }

    setSubmittingOrder(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionSlug: division.slug,
          materialId: activeMaterial.id,
          widthMm,
          heightMm,
          orientation,
          quantity: effectiveQuantity,
          sourceType: artworkMode,
          canvasJson: artworkMode === 'CANVAS_DESIGN' ? canvasPayload : null,
          uploadedArtworkPath: artworkMode === 'UPLOADED_FILE' ? uploadedArtworkPath : null,
          csvStoragePath: csvPath,
          csvRowCount: csvRows.length,
          customerNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/configure/${division.slug}`);
          return;
        }
        throw new Error(data.error ?? 'Failed to initialize order');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'Checkout error');
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left 8 Columns: Web-to-Print Designer / Uploader + CSV Merge */}
      <div className="space-y-6 lg:col-span-8">
        <div className="grid grid-cols-2 border border-[#141413] bg-white">
          <button
            type="button"
            onClick={() => setArtworkMode('CANVAS_DESIGN')}
            className={`flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              artworkMode === 'CANVAS_DESIGN'
                ? 'bg-[#141413] text-white'
                : 'bg-white text-[#141413] hover:bg-[#F5F4F0]'
            }`}
          >
            <PenTool className="h-4 w-4 text-[#E85D04]" />
            In-Browser Web-to-Print Designer
          </button>
          <button
            type="button"
            onClick={() => setArtworkMode('UPLOADED_FILE')}
            className={`flex items-center justify-center gap-2 border-l border-[#141413] py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              artworkMode === 'UPLOADED_FILE'
                ? 'bg-[#141413] text-white'
                : 'bg-white text-[#141413] hover:bg-[#F5F4F0]'
            }`}
          >
            <FileUp className="h-4 w-4 text-[#E85D04]" />
            Upload Finished File (PDF/SVG/AI/PNG)
          </button>
        </div>

        {artworkMode === 'CANVAS_DESIGN' ? (
          <PrintCanvasEditor
            division={division}
            widthMm={widthMm}
            heightMm={heightMm}
            csvPreviewRow={csvPreviewRow}
            onChange={setCanvasPayload}
          />
        ) : (
          <ArtworkUploader
            divisionSlug={division.slug}
            uploadedPath={uploadedArtworkPath}
            onUploaded={(path) => setUploadedArtworkPath(path)}
          />
        )}

        {division.supports_csv_merge && (
          <CsvMergeUploader
            divisionSlug={division.slug}
            onCsvParsed={({ storagePath, rows, previewRow }) => {
              if (storagePath) setCsvPath(storagePath);
              setCsvRows(rows);
              setCsvPreviewRow(previewRow);
            }}
          />
        )}
      </div>

      {/* Right 4 Columns: Parameter Controls, Save Design & Checkout */}
      <div className="space-y-6 lg:col-span-4">
        <div className="border border-[#141413] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#141413]/15 pb-3">
            <h2 className="font-heading text-lg font-bold">Job Specifications</h2>
            <button
              type="button"
              onClick={handleSwapOrientation}
              className="inline-flex items-center gap-1 border border-[#141413]/25 bg-[#F5F4F0] px-2 py-1 font-mono text-[10px] font-bold uppercase hover:border-[#141413]"
            >
              <RotateCw className="h-3 w-3" />
              {orientation}
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                Material / Substrate
              </label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 text-xs font-semibold"
              >
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({mat.price_multiplier}×)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={widthMm}
                  min={division.min_width_mm}
                  max={division.max_width_mm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 font-mono text-sm font-bold"
                />
                <span className="font-mono text-[10px] text-[#141413]/55">
                  {division.min_width_mm}–{division.max_width_mm}mm
                </span>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={heightMm}
                  min={division.min_height_mm}
                  max={division.max_height_mm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 font-mono text-sm font-bold"
                />
                <span className="font-mono text-[10px] text-[#141413]/55">
                  {division.min_height_mm}–{division.max_height_mm}mm
                </span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                Quantity {csvRows.length > 0 && '(Synced to CSV Rows)'}
              </label>
              <input
                type="number"
                value={effectiveQuantity}
                min={division.min_quantity}
                disabled={csvRows.length > 0}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 font-mono text-sm font-bold disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                Design Reference Title
              </label>
              <input
                type="text"
                value={designTitle}
                onChange={(e) => setDesignTitle(e.target.value)}
                className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#141413]/70">
                Pre-Press Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Pantone references, hole punch positions, or finishing notes..."
                className="mt-1 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 text-xs"
              />
            </div>
          </div>

          {pricing.validationErrors.length > 0 && (
            <div className="mt-4 border border-red-600 bg-red-50 p-3 text-xs font-semibold text-red-800">
              {pricing.validationErrors.map((err) => (
                <p key={err}>• {err}</p>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-[#141413] pt-4 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#141413]/65">Unit Price (ex VAT):</span>
              <span>
                £{pricing.discountedUnitPriceExVat.toFixed(4)}
                {pricing.discountPercent > 0 && ` (-${pricing.discountPercent}%)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/65">Pre-Press Setup:</span>
              <span>£{pricing.setupFeeExVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/65">VAT (20%):</span>
              <span>£{pricing.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[#141413]/20 pt-2.5 text-base font-bold">
              <span>Total inc. VAT:</span>
              <span>£{pricing.totalIncVat.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!pricing.isValid || submittingOrder}
              className="flex w-full items-center justify-center gap-2 bg-[#E85D04] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#cf5102] disabled:opacity-50 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              {submittingOrder ? 'Preparing Order...' : 'Submit Job & Checkout'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSaveDesign}
              disabled={savingDesign}
              className="flex w-full items-center justify-center gap-2 border border-[#141413] bg-white px-4 py-2.5 text-xs font-bold text-[#141413] hover:bg-[#141413] hover:text-white transition-colors"
            >
              <BookmarkCheck className="h-4 w-4" />
              {savingDesign ? 'Saving...' : 'Save Design to Account'}
            </button>
          </div>

          {statusMessage && (
            <p className="mt-3 border border-[#141413]/20 bg-[#F5F4F0] p-2.5 text-xs font-medium text-[#141413]">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}