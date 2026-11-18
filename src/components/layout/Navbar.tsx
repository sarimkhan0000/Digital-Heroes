"use client";

import React from "react";
import Link from "next/link";
import { Printer, Calculator, Layers, Sparkles, ArrowUpRight, ShoppingBag } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      {/* Top Micro Announcement Bar */}
      <div className="bg-[#0B0F17] text-white px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide text-slate-300">
              PRE-PRESS ENGINE v2.4 ONLINE • 300–600 DPI CALIBRATED WORKFLOW
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>UK &amp; EU EXPRESS DISPATCH</span>
            <span>•</span>
            <span className="text-orange-400 font-semibold">BULK TIERS UP TO 40% OFF</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E85D04] to-amber-600 text-white shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
            <Printer className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900 leading-none">
              DIGITAL HEROES
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-1">
              Industrial Web-to-Print
            </span>
          </div>
        </Link>

        {/* Center Nav Pills */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1">
          <Link
            href="/#divisions"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-[#E85D04]" />
            6 Divisions
          </Link>
          <Link
            href="/#calculator"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            <Calculator className="h-3.5 w-3.5 text-[#E85D04]" />
            Live Estimator
          </Link>
          <Link
            href="/#gallery"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E85D04]" />
            Press Gallery
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-slate-600" />
            Order Queue
          </Link>
          <Link
            href="/#divisions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#E85D04]"
          >
            Configure Job
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}