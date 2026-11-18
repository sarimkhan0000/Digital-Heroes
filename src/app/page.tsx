import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ShieldCheck, Sparkles, Zap, Layers } from 'lucide-react';
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
        <div className="flex flex-col justify-between gap-3 pb-8 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 font-mono text-xs font-semibold text-[#E85D04]">
              <Layers className="h-3.5 w-3.5" />
              6 SPECIALIZED PRODUCTION LINES
            </span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Production Divisions
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Parameter-driven sizing and substrate multipliers — no rigid SKU tables.
            </p>
          </div>
          <span className="font-mono text-xs font-medium text-slate-500">
            Select a division to configure &amp; design →
          </span>
        </div>

        <DivisionGrid divisions={safeDivisions} />
      </section>

      {/* Live Instant-Price Calculator */}
      <section id="calculator" className="mt-24 scroll-mt-24">
        <div className="pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
            REAL-TIME PRICING TELEMETRY
          </span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Instant Quote Calculator
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Live area calculation, volume discount tiers, and UK VAT breakdown.
          </p>
        </div>
        <LiveCalculator divisions={safeDivisions} materials={safeMaterials} />
      </section>

      {/* Production Gallery */}
      <section id="gallery" className="mt-24 scroll-mt-24 mb-16">
        <div className="pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
            CALIBRATED OUTPUTS
          </span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Recent Press &amp; Fabrication Work
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Modern SaaS Industrial Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0B0F17] text-white shadow-2xl border border-slate-800">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#E85D04]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Value Proposition */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 lg:border-r lg:border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-medium text-orange-300">
                <Sparkles className="h-3.5 w-3.5 text-[#E85D04]" />
                <span>Next-Gen Industrial Web-to-Print Engine</span>
              </div>

              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Custom print runs,{" "}
                <span className="bg-gradient-to-r from-[#FF7B29] via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  engineered to the millimeter.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
                Configure exact dimensions across six specialized production lines, merge variable CSV athlete data, and sign off calibrated proofs before your job enters press.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#divisions"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E85D04] to-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:brightness-110"
                >
                  Explore 6 Divisions
                  <ArrowDownRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#calculator"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  Instant Price Estimator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Glassmorphic Telemetry Strip */}
              <div className="mt-10 grid grid-cols-1 gap-3 pt-6 sm:grid-cols-3 border-t border-slate-800/80">
                <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5">
                  <div className="flex items-center gap-1.5 text-orange-400 text-xs font-mono">
                    <Zap className="h-3.5 w-3.5" />
                    <span>RESOLUTION</span>
                  </div>
                  <span className="mt-1 block font-mono text-sm font-bold text-white">
                    300 – 600 DPI
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                    <Layers className="h-3.5 w-3.5" />
                    <span>VOLUME TIERS</span>
                  </div>
                  <span className="mt-1 block font-mono text-sm font-bold text-white">
                    Up to 40% Off
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5">
                  <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>RELEASE RULE</span>
                  </div>
                  <span className="mt-1 block font-mono text-sm font-bold text-white">
                    Proof-Gated QA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Specimen Preview */}
          <div className="flex items-center justify-center bg-slate-900/60 p-6 sm:p-8 lg:col-span-5">
            <div className="w-full rounded-2xl bg-[#F5F4F0] p-5 text-[#141413] shadow-xl">
              <HeroSpecimen />
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-20 rounded-2xl border border-slate-200 bg-white p-12 text-center font-mono text-xs text-slate-500 shadow-sm">
            Loading manufacturing divisions &amp; calculator telemetry...
          </div>
        }
      >
        <StorefrontContent />
      </Suspense>
    </div>
  );
}