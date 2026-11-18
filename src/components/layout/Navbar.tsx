"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  Calculator,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShoppingBag,
  LogIn,
  LogOut,
  UserCheck,
  User,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createBrowserClient(url, key);

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const supabase = createBrowserClient(url, key);
      await supabase.auth.signOut();
    }
    setUserEmail(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      {/* Top Micro Announcement Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 px-4 py-1.5 text-xs font-mono">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRE-PRESS ENGINE v2.4 • 300–600 DPI CALIBRATED WORKFLOW</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-zinc-400">
            <span>UK &amp; EU EXPRESS DISPATCH</span>
            <span>•</span>
            <span className="text-zinc-200">BULK TIERS UP TO 40% OFF</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 transition group-hover:border-zinc-700">
            <Printer className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-sm font-bold tracking-tight text-zinc-100 leading-none">
              DIGITAL HEROES
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
              Industrial Print
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 font-mono text-xs">
          <Link
            href="/#divisions"
            className="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            Divisions
          </Link>
          <Link
            href="/#calculator"
            className="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <Calculator className="h-3.5 w-3.5 text-zinc-400" />
            Estimator
          </Link>
          <Link
            href="/#gallery"
            className="flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            Gallery
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/checkout"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
            Checkout
          </Link>

          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-300">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                {userEmail.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-900 hover:bg-red-950/50 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-400" />
              Login / Sign In
            </Link>
          )}

          <Link
            href="/#divisions"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white"
          >
            Configure
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
