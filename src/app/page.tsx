import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ShieldCheck, Zap, Layers, Cpu, CheckCircle2, Terminal } from 'lucide-react';
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
        <div className="flex flex-col justify-between gap-4 pb-6 border-b border-zinc-800 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
              <Cpu className="h-3.5 w-3.5 text-zinc-300" />
              PRODUCT_LINES_V2
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Production Divisions
            </h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-xl">
              Parameter-driven manufacturing lines with strict millimeter tolerances and substrate calibration.
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-500 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-md">
            API Sync: Active
          </span>
        </div>

        <div className="mt-8">
          <DivisionGrid divisions={safeDivisions} />
        </div>
      </section>

      {/* Live Instant-Price Calculator */}
      <section id="calculator" className="mt-32 scroll-mt-28">
        <div className="pb-6 border-b border-zinc-800">
          <div className="inline-flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-zinc-300" />
            TELEMETRY_ENGINE
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Instant Quote Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-xl">
            Real-time area calculation, tiered volume discounts, and itemized VAT estimation.
          </p>
        </div>
        <div className="mt-8">
          <LiveCalculator divisions={safeDivisions} materials={safeMaterials} />
        </div>
      </section>

      {/* Production Gallery */}
      <section id="gallery" className="mt-32 scroll-mt-28 mb-20">
        <div className="pb-6 border-b border-zinc-800">
          <div className="inline-flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />
            QUALITY_ASSURANCE
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Recent Press Runs
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-xl">
            Verified production output catalogued across divisions.
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
      {/* Professional Enterprise Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 p-8 sm:p-12 lg:p-16">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300">
              <Terminal className="h-3.5 w-3.5 text-zinc-400" />
              <span>DIGITAL HEROES INFRASTRUCTURE</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl leading-[1.1]">
              Industrial print execution, <br />
              <span className="text-zinc-400 font-normal">engineered precisely.</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              Automated pre-press verification, variable data CSV merging, and precise millimeter-scale configuration across specialized industrial production lines.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#divisions"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-900 transition hover:bg-white"
              >
                Browse Divisions
                <ArrowDownRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Price Estimator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Clean Enterprise Specs Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 font-mono text-xs">
              <div>
                <span className="block text-zinc-500">RESOLUTION</span>
                <span className="font-semibold text-zinc-200">300 – 600 DPI</span>
              </div>
              <div>
                <span className="block text-zinc-500">TURNAROUND</span>
                <span className="font-semibold text-zinc-200">24h Express</span>
              </div>
              <div>
                <span className="block text-zinc-500">VALIDATION</span>
                <span className="font-semibold text-zinc-200">Proof-Gated</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2 font-mono text-[11px] text-zinc-400">
                <span>SPECIMEN_PREVIEW.tsx</span>
                <span className="text-emerald-400 font-medium">● ACTIVE</span>
              </div>
              <div className="text-[#141413] bg-[#F5F4F0] rounded-lg p-4">
                <HeroSpecimen />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mt-20 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center font-mono text-xs text-zinc-500">
            Initializing production modules...
          </div>
        }
      >
        <StorefrontContent />
      </Suspense>
    </div>
  );
}
