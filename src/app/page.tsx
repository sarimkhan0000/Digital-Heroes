import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ShieldCheck, Sparkles, Zap, Layers, Cpu, CheckCircle2, Globe, Flame } from 'lucide-react';
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
      <section id="divisions" className="mt-32 scroll-mt-28">
        <div className="flex flex-col justify-between gap-4 pb-8 border-b border-slate-800/80 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 px-4 py-1.5 text-xs font-mono font-semibold text-orange-400 shadow-sm">
              <Cpu className="h-3.5 w-3.5 animate-pulse text-orange-400" />
              PARAMETER-DRIVEN MANUFACTURING
            </div>
            <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Production Divisions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              Select from six elite manufacturing pipelines featuring real-time millimeter sizing, custom substrate multipliers, and automated pre-press validation.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-4 py-2 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Supabase Cluster Synced
          </div>
        </div>

        <div className="mt-10">
          <DivisionGrid divisions={safeDivisions} />
        </div>
      </section>

      {/* Live Instant-Price Calculator */}
      <section id="calculator" className="mt-36 scroll-mt-28">
        <div className="pb-8 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 text-xs font-mono font-semibold text-blue-400 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            REAL-TIME TELEMETRY ENGINE
          </div>
          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Instant Quote &amp; Spec Calculator
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Dynamic area computation, automated volume discount scaling, and precise UK VAT calculations instantly rendered.
          </p>
        </div>
        <div className="mt-10">
          <LiveCalculator divisions={safeDivisions} materials={safeMaterials} />
        </div>
      </section>

      {/* Production Gallery */}
      <section id="gallery" className="mt-36 scroll-mt-28 mb-24">
        <div className="pb-8 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-mono font-semibold text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            CALIBRATED QUALITY ASSURANCE
          </div>
          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Recent Press &amp; Fabrication Work
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Inspect verified industrial production batches categorized by division and high-grade material specifications.
          </p>
        </div>
        <div className="mt-10">
          <PrintGallery />
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Elite Bento Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a0e17] to-[#040609] border border-slate-800 shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Glowing Background Orbs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#E85D04]/20 to-amber-500/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-600/15 to-indigo-600/5 blur-[140px]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-mono font-bold text-orange-300 shadow-inner backdrop-blur-md">
              <Flame className="h-4 w-4 text-[#E85D04]" />
              <span>INDUSTRIAL WEB-TO-PRINT INFRASTRUCTURE</span>
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Precision Print, <br />
              <span className="bg-gradient-to-r from-[#FF7B29] via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Engineered to the Millimeter.
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 font-normal">
              Configure exact parameters across 6 specialized production divisions, merge variable CSV data sets, and sign off high-DPI calibrated proofs before dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#divisions"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#E85D04] to-amber-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse Six Divisions
                <ArrowDownRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-800/40 px-8 py-4 text-sm font-bold text-slate-200 backdrop-blur-md transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              >
                Instant Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Glowing Bento Grid Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:border-orange-500/40">
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-mono font-bold">
                  <Zap className="h-3.5 w-3.5" />
                  <span>RESOLUTION</span>
                </div>
                <p className="mt-1.5 font-mono text-xl font-extrabold text-white">300 DPI</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
                  <Globe className="h-3.5 w-3.5" />
                  <span>DISPATCH</span>
                </div>
                <p className="mt-1.5 font-mono text-xl font-extrabold text-white">24h Express</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:border-sky-500/40">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>GATEWAY</span>
                </div>
                <p className="mt-1.5 font-mono text-xl font-extrabold text-white">Proof-Locked</p>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Specimen Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-3xl bg-slate-950/80 border border-slate-800/90 p-6 shadow-2xl relative backdrop-blur-xl group">
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider shadow-md">
                Live Interactive Specimen
              </div>
              <div className="text-[#141413] bg-[#F5F4F0] rounded-2xl p-5 shadow-inner transition-transform duration-300 group-hover:scale-[1.01]">
                <HeroSpecimen />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-32 rounded-3xl border border-slate-800 bg-slate-900/80 p-12 text-center font-mono text-xs text-slate-400 shadow-2xl animate-pulse">
            Synchronizing manufacturing divisions &amp; pricing matrix...
          </div>
        }
      >
        <StorefrontContent />
      </Suspense>
    </div>
  );
}
