import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { OrderRecord } from '@/types/database';
import { AdminPipelineBoard } from '@/components/dashboard/AdminPipelineBoard';

export default async function AdminPipelinePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');

  const adminDb = createAdminSupabaseClient();
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: orders } = await adminDb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#141413] pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#E85D04] font-bold">
            Admin Pre-Press &amp; Press-Floor Operations
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Production Pipeline
          </h1>
        </div>

        <a
          href="/api/xero-export"
          className="inline-flex items-center gap-2 border border-[#141413] bg-white px-4 py-2.5 font-mono text-xs font-bold hover:bg-[#141413] hover:text-white transition-colors"
        >
          <Download className="h-4 w-4 text-[#E85D04]" />
          Export Xero VAT Invoices (.CSV)
        </a>
      </div>

      <AdminPipelineBoard orders={(orders ?? []) as OrderRecord[]} />
    </div>
  );
}