'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSpecimen() {
  return (
    <div className="flex h-full flex-col justify-between border border-[#141413] bg-white p-6 sm:p-8">
      <div>
        <div className="flex items-center justify-between border-b border-[#141413]/15 pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E85D04] font-bold">
            Live Specimen // Division 01
          </span>
          <span className="bg-[#141413] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
            300 DPI BLEED
          </span>
        </div>

        <div className="my-8 flex items-center justify-center border border-dashed border-[#141413]/30 bg-[#F5F4F0] p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#E85D04] text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-bold">Labels &amp; Stickers</h3>
            <p className="mt-1 font-mono text-xs text-[#141413]/60">80×50mm • Gloss Vinyl</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/configure/labels-stickers?w=80&h=50&q=100"
          className="flex w-full items-center justify-center gap-2 bg-[#E85D04] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#cf5102] transition-colors"
        >
          Start Print Job (Labels &amp; Stickers)
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}