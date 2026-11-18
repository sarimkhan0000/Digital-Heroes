import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DivisionMaterial, ProductDivision } from '@/types/database';
import { DivisionGrid } from '@/components/storefront/DivisionGrid';
import { LiveCalculator } from '@/components/storefront/LiveCalculator';
import { PrintGallery } from '@/components/storefront/PrintGallery';
import { HeroSpecimen } from '@/components/storefront/HeroSpecimen';

async function StorefrontContent() {
  const supabase = await createServerSupabaseClient();

  const [{ data: divisions }, { data: materials }] = await Promise.all([
    supabase
      .from('product_divisions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase.from('division_materials').select('*').eq('is_active', true),
  ]);

  const safeDivisions = (divisions ?? []) as ProductDivision[];
  const safeMaterials = (materials ?? []) as DivisionMaterial[];

  return (
    <>
      {/* Six Product Divisions */}
      <section id="divisions" className="mt-20 scroll-mt-24">
        <div className="flex flex-col justify-between gap-2 pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Production Divisions
            </h2>
            <p className="mt-1 text-sm text-[#141413]/70">
              Parameter-driven sizing and substrate multipliers—no rigid SKU tables.
            </p>
          </div>
          <span className="font-mono text-xs text-[#141413]/60">
            Select a division to configure &amp; design
          </span>
        </div>

        <DivisionGrid divisions={safeDivisions} />
      </section>

      {/* Live Instant-Price Calculator */}
      <section id="calculator" className="mt-24 scroll-mt-24">
        <div className="pb-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Instant Quote Calculator
          </h2>
          <p className="mt-1 text-sm text-[#141413]/70">
            Live area calculation, volume discount tiers, and UK VAT breakdown.
          </p>
        </div>
        <LiveCalculator divisions={safeDivisions} materials={safeMaterials} />
      </section>

      {/* Production Gallery */}
      <section id="gallery" className="mt-24 scroll-mt-24">
        <div className="pb-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Recent Press &amp; Fabrication Work
          </h2>
          <p className="mt-1 text-sm text-[#141413]/70">
            Calibrated production runs organized by division.
          </p>
        </div>
        <PrintGallery />
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Editorial Split Hero */}
      <section className="grid grid-cols-1 border border-[#141413] bg-white lg:grid-cols-12">
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 lg:border-r lg:border-[#141413]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#141413]/60">
              Digital Heroes — Industrial Print &amp; Fabrication
            </p>

            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-[#141413] sm:text-5xl lg:text-6xl">
              Custom print runs, engineered to the millimeter.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#141413]/75">
              Configure exact dimensions across six specialized production lines, merge variable CSV athlete data, and sign off calibrated proofs before your job enters press.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#divisions"
                className="inline-flex items-center gap-2 bg-[#E85D04] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#cf5102]"
              >
                Browse Six Divisions
                <ArrowDownRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center gap-2 border border-[#141413] bg-white px-6 py-3.5 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#141413] hover:text-white"
              >
                Instant Price Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#141413]/15 pt-5 font-mono text-xs">
              <div>
                <span className="block text-[#141413]/50">Resolution</span>
                <span className="font-semibold">300 – 600 DPI</span>
              </div>
              <div>
                <span className="block text-[#141413]/50">Bulk Tiers</span>
                <span className="font-semibold">Up to 40% Off</span>
              </div>
              <div>
                <span className="block text-[#141413]/50">Release Rule</span>
                <span className="font-semibold">Proof-Gated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:col-span-5 bg-[#F5F4F0]/50">
          <HeroSpecimen />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-20 border border-[#141413]/20 bg-white p-12 text-center font-mono text-xs text-[#141413]/60">
            Loading manufacturing divisions &amp; calculator telemetry...
          </div>
        }
      >
        <StorefrontContent />
      </Suspense>
    </div>
  );
}