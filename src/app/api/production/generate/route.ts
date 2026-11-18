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

    const adminDb = createAdminSupabaseClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, orderId, adminMessage, stage } = body;

    if (action === 'GENERATE_FILES') {
      const result = await generateApprovedProductionFiles(orderId);
      return NextResponse.json({ ok: true, result });
    }

    if (action === 'UPLOAD_NEW_PROOF') {
      const { data: existingProofs } = await adminDb
        .from('order_proofs')
        .select('version_number')
        .eq('order_id', orderId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (existingProofs?.[0]?.version_number ?? 0) + 1;

      const { data: newProof, error: proofErr } = await adminDb
        .from('order_proofs')
        .insert({
          order_id: orderId,
          version_number: nextVersion,
          proof_file_path: `${orderId}/proof_v${nextVersion}.pdf`,
          preview_image_url: `/api/proof-preview/${orderId}?v=${nextVersion}`,
          status: 'PENDING',
          admin_message:
            adminMessage || `Updated proof v${nextVersion} uploaded by print studio.`,
          created_by: user.id,
        })
        .select()
        .single();

      if (proofErr || !newProof) {
        return NextResponse.json(
          { error: proofErr?.message ?? 'Failed to upload proof' },
          { status: 500 }
        );
      }

      await adminDb
        .from('orders')
        .update({ stage: 'PROOF', proof_approved: false, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      await adminDb.from('proof_audit_logs').insert({
        order_id: orderId,
        proof_id: newProof.id,
        version_number: nextVersion,
        action: 'PROOF_UPLOADED',
        actor_id: user.id,
        actor_email: user.email ?? 'ops@digitalheroes.studio',
        actor_role: 'admin',
        notes: adminMessage || `Uploaded proof v${nextVersion}`,
      });

      const { data: order } = await adminDb
        .from('orders')
        .select('order_number, user_id')
        .eq('id', orderId)
        .single();

      if (order) {
        const { data: customer } = await adminDb
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .single();

        if (customer?.email) {
          await sendTransactionalEmail({
            to: customer.email,
            subject: `Digital Proof v${nextVersion} Ready for Review — ${order.order_number}`,
            html: `<p>Your updated proof <strong>v${nextVersion}</strong> for order <strong>${order.order_number}</strong> is ready for review in your dashboard.</p>`,
          });
        }
      }

      return NextResponse.json({ ok: true, proof: newProof });
    }

    if (action === 'UPDATE_STAGE' && stage) {
      await adminDb
        .from('orders')
        .update({ stage, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Production API error' },
      { status: 500 }
    );
  }
}