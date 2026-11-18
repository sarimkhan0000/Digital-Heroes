import Link from 'next/link';
import { ProductDivision } from '@/types/database';
import { ArrowUpRight, Layers, ShieldCheck } from 'lucide-react';

interface DivisionGridProps {
  divisions: ProductDivision[];
}

export function DivisionGrid({ divisions }: DivisionGridProps) {
  if (!divisions || divisions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center font-mono text-xs text-zinc-400">
        No active production divisions found in database cluster.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {divisions.map((div, idx) => (
        <Link
          key={div.id}
          href={`/configure/${div.slug}`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1"
        >
          {/* Subtle top accent line on hover */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-zinc-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 border border-zinc-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-800">
                <Layers className="h-3 w-3 text-zinc-600" />
                LINE 0{idx + 1}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>

            <h3 className="font-heading text-xl font-bold tracking-tight text-zinc-900 group-hover:text-black transition-colors">
              {div.name}
            </h3>

            <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
              {div.description || "Precision engineered custom print run with parameter-driven millimeter sizing."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
              <span>300 DPI Calibrated</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover:text-black transition-colors">
              Configure Line
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
