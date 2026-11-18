import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const url = new URL(request.url);
  const version = url.searchParams.get('v') || '1';

  const adminDb = createAdminSupabaseClient();
  const { data: order } = await adminDb
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) {
    return new NextResponse('Order not found', { status: 404 });
  }

  const canvasData = (order.canvas_json ?? {}) as {
    backgroundColor?: string;
    elements?: Array<{
      type: string;
      content: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      heightMm: number;
      fontSizePt: number;
      color: string;
    }>;
  };

  const w = Number(order.width_mm);
  const h = Number(order.height_mm);
  const scale = Math.min(520 / Math.max(w, 1), 320 / Math.max(h, 1));
  const boxW = Math.round(w * scale);
  const boxH = Math.round(h * scale);

  const elementsSvg = (canvasData.elements ?? [])
    .filter((el) => el.type === 'text')
    .map((el) => {
      const cx = (el.xMm + el.widthMm / 2) * scale;
      const cy = (el.yMm + el.heightMm * 0.65) * scale;
      const fontSize = Math.max(10, el.fontSizePt * 0.3527 * scale);
      const safeText = (el.content || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}px" fill="${
        el.color || '#141413'
      }">${safeText}</text>`;
    })
    .join('\n');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="440" viewBox="0 0 640 440">
      <rect width="640" height="440" fill="#F5F4F0" />
      <rect x="20" y="20" width="600" height="400" fill="#FFFFFF" stroke="#141413" stroke-width="1.5" />
      <text x="36" y="46" font-family="monospace" font-size="11" font-weight="bold" fill="#141413">
        DIGITAL HEROES // DIGITAL PROOF SHEET v${version} — ${order.order_number}
      </text>
      <text x="36" y="64" font-family="monospace" font-size="10" fill="#555555">
        TRIM: ${w}x${h}mm | QTY: ${order.quantity} | SUBSTRATE: ${order.material_name}
      </text>
      <g transform="translate(${(640 - boxW) / 2}, ${(460 - boxH) / 2})">
        <rect x="-8" y="-8" width="${boxW + 16}" height="${boxH + 16}" fill="none" stroke="#E85D04" stroke-dasharray="4 3" stroke-width="1" />
        <rect width="${boxW}" height="${boxH}" fill="${canvasData.backgroundColor || '#FFFFFF'}" stroke="#141413" stroke-width="1.5" />
        ${elementsSvg}
      </g>
      <text x="320" y="405" text-anchor="middle" font-family="monospace" font-size="10" fill="#E85D04" font-weight="bold">
        PROOF GATE: VERIFY SPELLING, SAFE MARGINS &amp; BLEED BEFORE SIGN-OFF
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    },
  });
}