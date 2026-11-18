import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ShieldCheck, Sparkles, Zap, Layers, Cpu, CheckCircle2 } from 'lucide-react';
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
      <section id="divisions" className="mt-28 scroll-mt-28">
        <div className="flex flex-col justify-between gap-4 pb-8 border-b border-slate-800 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3.5 py-1 text-xs font-mono font-semibold text-[#E85D04]">
              <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              PARAMETER-DRIVEN FABRICATION
            </div>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Production Divisions
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Choose from six specialized manufacturing pipelines with dynamic millimeter sizing, custom substrates, and instant proof validation.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            Live Database Sync Active
          </span>
        </div>

        <div className="mt-8">
          <DivisionGrid divisions={safeDivisions} />
        </div>
      </section>

      {/* Live Instant-Price Calculator */}
      <section id="calculator" className="mt-32 scroll-mt-28">
        <div className="pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-mono font-semibold text-blue-400">
            <Zap className="h-3.5 w-3.5" />
            REAL-TIME COST ENGINE
          </div>
          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Instant Quote &amp; Specification Calculator
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Calculate exact square-meter pricing, automated volume discount tiers, and transparent UK VAT breakdowns instantly.
          </p>
        </div>
        <div className="mt-8">
          <LiveCalculator divisions={safeDivisions} materials={safeMaterials} />
        </div>
      </section>

      {/* Production Gallery */}
      <section id="gallery" className="mt-32 scroll-mt-28 mb-20">
        <div className="pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            QUALITY ASSURANCE
          </div>
          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Recent Press &amp; Fabrication Work
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Inspect calibrated industrial output samples organized by division and material grade.
          </p>
        </div>
        <div className="mt-8">
          <PrintGallery />
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* High-Impact Enterprise Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#07090e] border border-slate-800/80 shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Ambient Neon Background Effects */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-[#E85D04]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-mono font-semibold text-orange-300 shadow-inner">
              <Sparkles className="h-4 w-4 text-[#E85D04]" />
              <span>Next-Gen Web-to-Print Manufacturing Engine</span>
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl">
              Industrial Print, <br />
              <span className="bg-gradient-to-r from-[#FF7B29] via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Engineered to the Millimeter.
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
              Configure exact specifications across 6 specialized production lines, merge variable CSV variable data, and sign off calibrated prepress proofs before your job hits the press.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#divisions"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#E85D04] to-amber-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-orange-500/25 transition-all hover:brightness-110 hover:scale-[1.02]"
              >
                Browse Six Divisions
                <ArrowDownRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/50 px-7 py-4 text-sm font-semibold text-slate-200 backdrop-blur transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              >
                Instant Price Calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Metrics Trust Strip */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-mono font-bold">
                  <Zap className="h-3.5 w-3.5" />
                  <span>DPI RESOLUTION</span>
                </div>
                <p className="font-mono text-lg font-extrabold text-white">300 – 600</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                  <Layers className="h-3.5 w-3.5" />
                  <span>DISPATCH SPEED</span>
                </div>
                <p className="font-mono text-lg font-extrabold text-white">24h – 48h</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>QA GATEWAY</span>
                </div>
                <p className="font-mono text-lg font-extrabold text-white">Proof-Locked</p>
              </div>
            </div>
          </div>

          {/* Right Hero Specimen Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-2xl relative">
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-semibold uppercase tracking-wider">
                Live Interactive Specimen
              </div>
              <div className="text-[#141413] bg-[#F5F4F0] rounded-xl p-4 shadow-inner">
                <HeroSpecimen />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-28 rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center font-mono text-xs text-slate-400 shadow-xl animate-pulse">
            Loading manufacturing divisions &amp; real-time telemetry...
          </div>
        }
      >
        <StorefrontContent />
      </Suspense>
    </div>
  );
}