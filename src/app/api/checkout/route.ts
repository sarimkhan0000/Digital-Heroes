import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateProductPrice } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const divisionSlug = String(body.divisionSlug || '');
    const rawWidthMm = Number(body.widthMm);
    const rawHeightMm = Number(body.heightMm);
    const rawQuantity = Number(body.quantity || 1);

    let { data: division } = await supabase
      .from('product_divisions')
      .select('*')
      .eq('slug', divisionSlug)
      .maybeSingle();

    if (!division) {
      const { data: fallbackDivisions } = await supabase
        .from('product_divisions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1);

      division = fallbackDivisions?.[0] ?? null;
    }

    if (!division) {
      return NextResponse.json(
        { error: 'No active product divisions configured in database' },
        { status: 400 }
      );
    }

    let materialName = 'Standard Material';
    let materialId: string | null = body.materialId || null;
    let materialMultiplier = 1;

    if (materialId) {
      const { data: material } = await supabase
        .from('division_materials')
        .select('*')
        .eq('id', materialId)
        .maybeSingle();

      if (material) {
        materialName = material.name;
        materialMultiplier = Number(material.price_multiplier) || 1;
      } else {
        materialId = null;
      }
    }

    if (!materialId) {
      const { data: fallbackMaterials } = await supabase
        .from('division_materials')
        .select('*')
        .eq('division_id', division.id)
        .limit(1);

      const defaultMat = fallbackMaterials?.[0];
      if (defaultMat) {
        materialId = defaultMat.id;
        materialName = defaultMat.name;
        materialMultiplier = Number(defaultMat.price_multiplier) || 1;
      }
    }

    const minW = Number(division.min_width_mm) || 100;
    const maxW = Number(division.max_width_mm) || 500;
    const minH = Number(division.min_height_mm) || 100;
    const maxH = Number(division.max_height_mm) || 500;
    const minQ = Number(division.min_quantity) || 1;

    const widthMm =
      Number.isFinite(rawWidthMm) && rawWidthMm >= minW && rawWidthMm <= maxW
        ? rawWidthMm
        : Math.round((minW + maxW) / 2);

    const heightMm =
      Number.isFinite(rawHeightMm) && rawHeightMm >= minH && rawHeightMm <= maxH
        ? rawHeightMm
        : Math.round((minH + maxH) / 2);

    const quantity =
      Number.isFinite(rawQuantity) && rawQuantity >= minQ ? rawQuantity : minQ;

    const pricing = calculateProductPrice({
      widthMm,
      heightMm,
      minWidthMm: minW,
      maxWidthMm: maxW,
      minHeightMm: minH,
      maxHeightMm: maxH,
      quantity,
      minQuantity: minQ,
      baseSetupFee: Number(division.base_setup_fee),
      baseRatePerSqCm: Number(division.base_rate_per_sq_cm),
      materialMultiplier,
    });

    if (!pricing.isValid) {
      return NextResponse.json(
        { error: pricing.validationErrors[0] || 'Invalid job dimensions or quantity' },
        { status: 400 }
      );
    }

    const orderNumber = `DH-${Math.floor(100000 + Math.random() * 900000)}`;
    const orientation =
      body.orientation === 'portrait' || body.orientation === 'landscape'
        ? body.orientation
        : widthMm >= heightMm
          ? 'landscape'
          : 'portrait';

    const insertPayload = {
      order_number: orderNumber,
      user_id: user.id,
      division_id: division.id,
      material_id: materialId,
      division_slug: division.slug,
      material_name: materialName,
      width_mm: widthMm,
      height_mm: heightMm,
      orientation,
      quantity,
      source_type: body.sourceType === 'UPLOADED_FILE' ? 'UPLOADED_FILE' : 'CANVAS_DESIGN',
      canvas_json: body.sourceType === 'UPLOADED_FILE' ? null : (body.canvasJson ?? null),
      uploaded_artwork_path:
        body.sourceType === 'UPLOADED_FILE' ? (body.uploadedArtworkPath ?? null) : null,
      csv_storage_path: body.csvStoragePath ?? null,
      csv_row_count: Number(body.csvRowCount || 0),
      unit_price_ex_vat: pricing.discountedUnitPriceExVat,
      setup_fee_ex_vat: pricing.setupFeeExVat,
      discount_percent: pricing.discountPercent,
      subtotal_ex_vat: pricing.subtotalExVat,
      vat_rate: 0.2,
      vat_amount: pricing.vatAmount,
      total_inc_vat: pricing.totalIncVat,
      currency: 'GBP',
      is_paid: false,
      stage: 'ORDER',
      proof_approved: false,
      production_files_generated: false,
      production_manifest: [],
      customer_notes: body.customerNotes ? String(body.customerNotes).trim() : null,
    };

    const { data: createdOrder, error: insertError } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !createdOrder) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to save order to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
      checkoutUrl: `/checkout?orderId=${createdOrder.id}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}






