import LogoutButton from "@/components/LogoutButton";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock, Plus } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { OrderRecord } from '@/types/database';

export default async function CustomerDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profile }, { data: orders }, { data: savedDesigns }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('saved_designs')
      .select('*, product_divisions(slug, name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const typedOrders = (orders ?? []) as OrderRecord[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#141413] pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#141413]/60">
            Customer Studio Workspace
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            {profile?.company_name || profile?.full_name || user.email}
          </h1>
        </div>

        <Link
          href="/#divisions"
          className="inline-flex items-center gap-2 bg-[#E85D04] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cf5102] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Print Job
        </Link>
      </div>

      {/* Active & Past Print Orders */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold">Orders &amp; Proof Gate Status</h2>
        {typedOrders.length === 0 ? (
          <div className="mt-4 border border-[#141413]/20 bg-white p-8 text-center text-sm text-[#141413]/70">
            No print orders yet. Select any of the six divisions to configure and submit your first job.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto border border-[#141413] bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#141413] bg-[#F5F4F0] font-mono uppercase text-[#141413]/75">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Division &amp; Spec</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Proof Gate</th>
                  <th className="px-4 py-3">Total (inc VAT)</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141413]/10">
                {typedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F5F4F0]/50">
                    <td className="px-4 py-3.5 font-mono font-bold">{order.order_number}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold block">{order.division_slug}</span>
                      <span className="font-mono text-[11px] text-[#141413]/65">
                        {order.width_mm}Ã—{order.height_mm}mm â€¢ {order.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">{order.stage}</td>
                    <td className="px-4 py-3.5">
                      {order.proof_approved ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#E85D04]">
                          <Clock className="h-3.5 w-3.5" />
                          Review Needed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">
                      Â£{Number(order.total_inc_vat).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 border border-[#141413] px-3 py-1.5 font-mono text-[11px] font-bold hover:bg-[#141413] hover:text-white transition-colors"
                      >
                        {order.proof_approved ? 'Invoice & Details' : 'Review Proof'}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Saved Artwork Templates for One-Click Reorder */}
      <section className="mt-12">
        <h2 className="font-heading text-xl font-bold">Saved Configurations &amp; Artwork</h2>
        {!savedDesigns || savedDesigns.length === 0 ? (
          <p className="mt-2 text-xs text-[#141413]/65">
            Save any configured design inside the studio to reorder in one click.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedDesigns.map((design) => {
              const divInfo = design.product_divisions as { slug: string; name: string } | null;
              return (
                <div key={design.id} className="border border-[#141413] bg-white p-5">
                  <span className="font-mono text-[10px] uppercase text-[#E85D04] font-bold">
                    {divInfo?.name ?? 'Saved Spec'}
                  </span>
                  <h3 className="mt-1 font-heading text-base font-bold">{design.title}</h3>
                  <p className="mt-1 font-mono text-xs text-[#141413]/70">
                    {design.width_mm}Ã—{design.height_mm}mm â€¢ {design.quantity} units
                  </p>
                  <Link
                    href={`/configure/${divInfo?.slug ?? 'labels-stickers'}?w=${design.width_mm}&h=${design.height_mm}&q=${design.quantity}&m=${design.material_id}`}
                    className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-bold underline decoration-[#E85D04] underline-offset-4 hover:text-[#E85D04]"
                  >
                    Reopen &amp; Reorder
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Account / Session Logout */}
      <section className="mt-12 border-t border-[#141413]/15 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-sm font-bold text-[#141413]">Session Controls</h2>
          <p className="text-xs text-[#141413]/65">Sign out of your client portal session.</p>
        </div>
        <LogoutButton />
      </section>
    </div>
  );
}
