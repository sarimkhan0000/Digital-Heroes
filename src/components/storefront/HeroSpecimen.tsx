'use client';

import React, { useState } from 'react';
import { Layers, Sliders, CheckCircle2, Sparkles } from 'lucide-react';

export function HeroSpecimen() {
  const [activeTab, setActiveTab] = useState<'bib' | 'stencil'>('bib');

  return (
    <div className="space-y-4">
      {/* Specimen Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-800">
          <Layers className="h-4 w-4 text-zinc-600" />
          <span>LIVE SPECIMEN PREVIEW</span>
        </div>
        <div className="flex gap-1.5 bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('bib')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'bib'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Alpine Bib
          </button>
          <button
            onClick={() => setActiveTab('stencil')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'stencil'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Eurorack Stencil
          </button>
        </div>
      </div>

      {/* Specimen Render Box */}
      {activeTab === 'bib' ? (
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-slate-900 via-zinc-900 to-zinc-950 p-6 text-white shadow-inner relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-[11px] font-mono font-semibold text-zinc-300">
              <Sparkles className="h-3 w-3 text-zinc-400" />
              NORTHFACE ALPINE SERIES
            </span>
            <span className="font-mono text-xs text-zinc-400">SKU-992-NV</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading text-lg font-bold tracking-tight text-white">
              GORE-TEX Pro Bibing &amp; Variable Data Tag
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Calibrated laser-cut patch with variable athlete serial numbers and waterproof TPU heat-seal bonding.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-400">Substrate: 3L Cordura</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 300 DPI Verified
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-slate-900 to-black p-6 text-white shadow-inner relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-[11px] font-mono font-semibold text-zinc-300">
              <Sliders className="h-3 w-3 text-zinc-400" />
              EURORACK SYNTH CALIBRATION
            </span>
            <span className="font-mono text-xs text-zinc-400">PANEL-HP-84</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading text-lg font-bold tracking-tight text-white">
              Anodized Aluminum Stencil &amp; Panel Mask
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Precision milled 2mm brushed aluminum with high-contrast UV cured silkscreen markings for modular synth calibrating.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-400">Tolerance: ±0.05mm</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Millimeter Perfect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
