import Image from 'next/image';
import { Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: '1',
    title: 'Precision Laser-Cut Acrylic Stencils',
    division: 'Industrial Panels',
    substrate: '3mm Cast Acrylate',
    resolution: '600 DPI Calibrated',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    tag: 'Laser-Cut Work',
  },
  {
    id: '2',
    title: 'Variable Data Athletic Bibs',
    division: 'Apparel & Textiles',
    substrate: '3L Cordura Technical',
    resolution: '300 DPI Thermal',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    tag: 'Textile Print',
  },
  {
    id: '3',
    title: 'Anodized Aluminum Control Panels',
    division: 'Eurorack & Synthesizers',
    substrate: '2mm Brushed Aluminum',
    resolution: '1200 DPI UV Cured',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    tag: 'Milled & Etched',
  },
];

export function PrintGallery() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {GALLERY_ITEMS.map((item) => (
        <div
          key={item.id}
          className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 shadow-xl"
        >
          <div className="relative h-48 w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 mb-4">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900/90 border border-zinc-700 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-200 backdrop-blur-md">
                <Layers className="h-3 w-3 text-zinc-400" />
                {item.tag}
              </span>
            </div>
          </div>

          <div>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              {item.division}
            </span>
            <h3 className="mt-1 font-heading text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
              {item.title}
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400">
              Substrate: <span className="text-zinc-200">{item.substrate}</span>
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              {item.resolution}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
