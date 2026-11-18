'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProductDivision } from '@/types/database';

export function DivisionGrid({ divisions }: { divisions: ProductDivision[] }) {
  if (!divisions || divisions.length === 0) {
    return (
      <div className="border border-[#141413] bg-white p-8 text-center text-xs font-mono">
        Loading manufacturing divisions...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {divisions.map((div) => (
        <Link
          key={div.id}
          href={`/configure/${div.slug}`}
          className="group flex flex-col justify-between border border-[#141413] bg-white p-6 transition-all hover:border-[#E85D04] hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E85D04]">
                {div.slug}
              </span>
              <span className="flex h-8 w-8 items-center justify-center border border-[#141413] bg-[#F5F4F0] group-hover:bg-[#E85D04] group-hover:text-white group-hover:border-[#E85D04] transition-colors">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <h3 className="mt-4 font-heading text-xl font-bold tracking-tight">
              {div.name}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[#141413]/70">
              {div.tagline}
            </p>
          </div>

          <div className="mt-6 border-t border-[#141413]/10 pt-4 font-mono text-[11px] text-[#141413]/60 flex justify-between">
            <span>Min Qty: {div.min_quantity} units</span>
            <span>{div.output_dpi} DPI</span>
          </div>
        </Link>
      ))}
    </div>
  );
}