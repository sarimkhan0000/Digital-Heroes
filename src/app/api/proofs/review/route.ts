import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { generateApprovedProductionFiles } from '@/lib/print-generator';
import { sendTransactionalEmail } from '@/lib/notifications';

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
    const { proofId, orderId, decision, feedback } = body;

    if (!proofId || !orderId || !['APPROVED', 'CHANGES_REQUESTED'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
    }

    const adminDb = createAdminSupabaseClient();

    const [{ data: order }, { data: proof }, { data: profile }] = await Promise.all([
      adminDb.from('orders').select('*').eq('id', orderId).single(),
      adminDb.from('order_proofs').select('*').eq('id', proofId).single(),
      adminDb.from('profiles').select('*').eq('id', user.id).single(),
    ]);

    if (!order || !proof) {
      return NextResponse.json({ error: 'Order or proof not found' }, { status: 404 });
    }

    if (order.user_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: updateErr } = await adminDb
      .from('order_proofs')
      .update({
        status: decision,
        customer_feedback: feedback || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proofId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await adminDb.from('proof_audit_logs').insert({
      order_id: orderId,
      proof_id: proofId,
      version_number: proof.version_number,
      action: decision,
      actor_id: user.id,
      actor_email: user.email ?? 'unknown@user',
      actor_role: profile?.role ?? 'customer',
      notes:
        feedback ||
        (decision === 'APPROVED'
          ? 'Customer approved proof for production release.'
          : 'Customer requested artwork revisions.'),
    });

    if (decision === 'APPROVED') {
      const productionResult = await generateApprovedProductionFiles(orderId);

      await sendTransactionalEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || 'ops@digitalheroes.studio',
        subject: `[PRODUCTION UNLOCKED] ${order.order_number} — Proof v${proof.version_number} Approved`,
        html: `<p>Order <strong>${order.order_number}</strong> has been signed off by ${user.email}. ${productionResult.filesCount} press-ready file(s) generated in folder <code>${productionResult.folderName}</code>.</p>`,
      });

      return NextResponse.json({
        status: 'APPROVED',
        production: productionResult,
      });
    }

    await sendTransactionalEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL || 'ops@digitalheroes.studio',
      subject: `[PROOF REVISION REQUESTED] ${order.order_number} — v${proof.version_number}`,
      html: `<p>Customer requested changes on <strong>${order.order_number}</strong>:</p><blockquote>${feedback || 'No notes provided'}</blockquote>`,
    });

    return NextResponse.json({ status: 'CHANGES_REQUESTED' });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proof review error' },
      { status: 500 }
    );
  }
}