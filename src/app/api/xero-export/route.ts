import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { buildXeroInvoiceCsv } from '@/lib/xero-invoice';
import { OrderRecord } from '@/types/database';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const adminDb = createAdminSupabaseClient();
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { data: orders } = await adminDb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const csvContent = buildXeroInvoiceCsv((orders ?? []) as OrderRecord[]);

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="digital-heroes-xero-vat-${
        new Date().toISOString().split('T')[0]
      }.csv"`,
    },
  });
}