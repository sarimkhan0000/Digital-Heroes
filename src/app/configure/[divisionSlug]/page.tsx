import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DivisionMaterial, ProductDivision } from '@/types/database';
import { ConfiguratorWorkspace } from '@/components/designer/ConfiguratorWorkspace';

// Allow blocking dynamic route in Next.js 16
export const instant = false;

interface PageProps {
  params: Promise<{ divisionSlug: string }>;
  searchParams: Promise<{ w?: string; h?: string; q?: string; m?: string }>;
}

export default async function ConfigureDivisionPage({
  params,
  searchParams,
}: PageProps) {
  const { divisionSlug } = await params;
  const query = await searchParams;

  const decodedSlug = decodeURIComponent(divisionSlug).trim();

  const supabase = await createServerSupabaseClient();
  
  const { data: division, error: divError } = await supabase
    .from('product_divisions')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle();

  if (divError || !division) {
    console.error('Division fetch error or not found for slug:', decodedSlug, divError);
    notFound();
  }

  const { data: materials } = await supabase
    .from('division_materials')
    .select('*')
    .eq('division_id', division.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#141413] pb-5 sm:flex-row sm:items-end">
        <div>
          <Link
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#141413]/70 hover:text-[#E85D04]"
            href="/#divisions"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Six Divisions
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">
            {division.name}
          </h1>
          <p className="mt-1 text-sm text-[#141413]/75">{division.tagline}</p>
        </div>

        <div className="font-mono text-xs text-[#141413]/75">
          Output: <strong>{division.output_dpi ?? 300} DPI</strong> • Bleed:{' '}
          <strong>{division.bleed_mm ?? 2}mm</strong> • Safe Margin:{' '}
          <strong>{division.safe_margin_mm ?? 3}mm</strong>
        </div>
      </div>

      <ConfiguratorWorkspace
        division={division as ProductDivision}
        materials={(materials ?? []) as DivisionMaterial[]}
        initialWidth={query.w ? Number(query.w) : undefined}
        initialHeight={query.h ? Number(query.h) : undefined}
        initialQuantity={query.q ? Number(query.q) : undefined}
        initialMaterialId={query.m}
      />
    </div>
  );
}