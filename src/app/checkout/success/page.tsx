import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2 } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: order } = orderId
    ? await supabase.from('orders').select('*').eq('id', orderId).single()
    : { data: null };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="border border-[#141413] bg-white p-8">
        <div className="flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Payment Confirmed • Job Queued
          </span>
        </div>

        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">
          Order {order?.order_number ?? 'Confirmed'}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#141413]/75">
          Your specifications and artwork have entered the pre-press pipeline. Per Digital Heroes production policy, <strong>high-resolution print files remain locked</strong> until you explicitly approve your digital proof (v1).
        </p>

        {order && (
          <div className="mt-6 border border-[#141413]/15 bg-[#F5F4F0] p-4 font-mono text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#141413]/60">Product:</span>
              <span className="font-bold">{order.division_slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/60">Dimensions:</span>
              <span>
                {order.width_mm} × {order.height_mm} mm ({order.quantity} units)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/60">Total Paid (inc. VAT):</span>
              <span className="font-bold">£{Number(order.total_inc_vat).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/60">Pipeline Stage:</span>
              <span className="font-bold text-[#E85D04]">{order.stage}</span>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={order ? `/dashboard/orders/${order.id}` : '/dashboard'}
            className="flex flex-1 items-center justify-center gap-2 bg-[#E85D04] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cf5102] transition-colors"
          >
            <FileCheck2 className="h-4 w-4" />
            Review &amp; Approve Proof v1
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}