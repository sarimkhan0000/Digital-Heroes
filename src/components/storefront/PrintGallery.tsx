'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  division: string;
  slug: string;
  specs: string;
  finish: string;
  accentHex: string;
}

const SHOWCASE_WORK: GalleryItem[] = [
  {
    id: 'GW-101',
    title: 'NorthFace Alpine Trail Series Bibs',
    division: 'Race & Event Numbers',
    slug: 'race-event-numbers',
    specs: '210×150mm • 450 Variable CSV Rows • 3mm Bleed',
    finish: 'DuPont™ Tyvek® 105gsm Tear-Proof',
    accentHex: '#E85D04',
  },
  {
    id: 'GW-102',
    title: 'VeloCore Enduro Downhill Number Plates',
    division: 'MTB Boards',
    slug: 'mtb-boards',
    specs: '195×180mm • Custom Contour Safe Zone • 300 DPI',
    finish: '1.2mm Flexible Matte Polypropylene',
    accentHex: '#141413',
  },
  {
    id: 'GW-103',
    title: 'Kanso Roasters Batch Seal Decals',
    division: 'Labels & Stickers',
    slug: 'labels-stickers',
    specs: '65×40mm Die-Cut • 2,500 Units • 3mm Bleed',
    finish: 'Matte Architectural Vinyl (100µm)',
    accentHex: '#2B5B4E',
  },
  {
    id: 'GW-104',
    title: 'Atelier Kova Packaging Inspection Stamp',
    division: 'Stamps',
    slug: 'stamps',
    specs: '58×22mm • 600 DPI 1-Bit Monochrome Laser Die',
    finish: 'Trodat Self-Inking Archival Black',
    accentHex: '#3A3A38',
  },
  {
    id: 'GW-105',
    title: 'British Gravel Championship Monolith Award',
    division: 'Trophies',
    slug: 'trophies',
    specs: '120×200mm • Fixed Engraving Bounding Box',
    finish: 'American Black Walnut + Brushed Brass',
    accentHex: '#8C5A2B',
  },
  {
    id: 'GW-106',
    title: 'Modular Synth Eurorack Calibration Stencils',
    division: 'Laser-Cut Work',
    slug: 'laser-cut-work',
    specs: '150×100mm • 0.01mm Red Vector Cut + Raster Engrave',
    finish: '3mm Safety Orange Cast Acrylic',
    accentHex: '#E85D04',
  },
];

export function PrintGallery() {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', ...Array.from(new Set(SHOWCASE_WORK.map((w) => w.division)))];
  const visibleItems =
    filter === 'ALL' ? SHOWCASE_WORK : SHOWCASE_WORK.filter((w) => w.division === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors ${
              filter === cat
                ? 'bg-[#141413] text-white'
                : 'bg-white border border-[#141413]/15 text-[#141413]/75 hover:border-[#141413]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-[#141413]/15 bg-white"
          >
            <div
              className="relative flex h-44 flex-col justify-between p-5 text-white"
              style={{ backgroundColor: item.accentHex }}
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-80">
                <span>SPECIMEN // {item.id}</span>
                <span>QA VERIFIED</span>
              </div>
              <div>
                <span className="inline-block rounded bg-black/25 px-2 py-0.5 font-mono text-[10px] uppercase">
                  {item.division}
                </span>
                <h4 className="mt-1.5 font-heading text-lg font-bold leading-snug">
                  {item.title}
                </h4>
              </div>
            </div>

            <div className="p-5">
              <p className="font-mono text-xs text-[#141413]/70">{item.specs}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#141413]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#E85D04]" />
                <span>{item.finish}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}