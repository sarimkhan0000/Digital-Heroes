import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileCheck2, Receipt } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OrderProof, OrderRecord } from '@/types/database';
import { ProofReviewCard } from '@/components/dashboard/ProofReviewCard';

interface OrderDetailProps {
  params: Promise<{ orderId: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderDetailProps) {
  const { orderId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: order }, { data: proofs }, { data: auditLogs }, { data: profile }] =
    await Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase
        .from('order_proofs')
        .select('*')
        .eq('order_id', orderId)
        .order('version_number', { ascending: false }),
      supabase
        .from('proof_audit_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

  if (!order) notFound();
  const typedOrder = order as OrderRecord;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#141413] pb-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#141413]/70 hover:text-[#E85D04]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Orders &amp; Designs
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
            {typedOrder.order_number}
          </h1>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="border border-[#141413] bg-white px-3 py-1.5 font-bold">
            STAGE: {typedOrder.stage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 8 Columns: Proof Review Gate + Audit History */}
        <div className="space-y-6 lg:col-span-8">
          <ProofReviewCard
            orderId={typedOrder.id}
            orderNumber={typedOrder.order_number}
            proofs={(proofs ?? []) as OrderProof[]}
            proofApproved={typedOrder.proof_approved}
          />

          {/* Immutable Proof Audit Log */}
          <div className="border border-[#141413] bg-white p-6">
            <h3 className="font-heading text-base font-bold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#E85D04]" />
              Proof Audit Trail
            </h3>
            <div className="mt-4 divide-y divide-[#141413]/10 font-mono text-xs">
              {(auditLogs ?? []).map((log) => (
                <div key={log.id} className="py-2.5 flex flex-wrap justify-between gap-2">
                  <div>
                    <span className="font-bold">{log.action}</span> (v{log.version_number}) —{' '}
                    <span className="text-[#141413]/75">{log.notes}</span>
                  </div>
                  <span className="text-[#141413]/55">
                    {log.actor_email} • {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: UK VAT Invoice & Production Telemetry */}
        <div className="space-y-6 lg:col-span-4">
          <div className="border border-[#141413] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#141413]/15 pb-3">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#E85D04]" />
                UK VAT Tax Invoice
              </h3>
              <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                PAID
              </span>
            </div>

            <div className="mt-4 font-mono text-xs space-y-2">
              <p className="font-bold">Digital Heroes Print &amp; Fabrication Ltd.</p>
              <p className="text-[#141413]/65">UK VAT Reg: GB 419 8821 09</p>
              <div className="border-t border-[#141413]/10 pt-2">
                <span className="text-[#141413]/60">Billed To:</span>
                <p className="font-semibold">
                  {profile?.company_name || profile?.full_name || user.email}
                </p>
                {profile?.vat_number && (
                  <p className="text-[#141413]/65">Customer VAT: {profile.vat_number}</p>
                )}
              </div>

              <div className="border-t border-[#141413]/10 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#141413]/65">Division:</span>
                  <span className="font-bold">{typedOrder.division_slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141413]/65">Size &amp; Qty:</span>
                  <span>
                    {typedOrder.width_mm}×{typedOrder.height_mm}mm ({typedOrder.quantity})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141413]/65">Net (ex VAT):</span>
                  <span>£{Number(typedOrder.subtotal_ex_vat).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141413]/65">VAT (20%):</span>
                  <span>£{Number(typedOrder.vat_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#141413] pt-2 text-sm font-bold">
                  <span>Total (inc. VAT):</span>
                  <span>£{Number(typedOrder.total_inc_vat).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}