"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Printer, LogIn, ArrowLeft, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setErrorMsg("Supabase environment variables are missing.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient(url, key);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  // 🚀 Guest Mode Handler
  const handleGuestContinue = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition">
            <ArrowLeft className="h-4 w-4" /> Back to Storefront
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#E85D04] flex items-center justify-center text-white">
              <Printer className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-sm">Digital Heroes</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Client Sign In</h1>
          <p className="text-slate-400 text-xs mt-1">
            Access your pre-press portal and order history.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Business Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#E85D04] to-amber-600 text-white font-semibold text-sm transition hover:brightness-110 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </form>

        {/* Guest Mode Divider & Button */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3">Just want to test the configurator?</p>
          <button
            onClick={handleGuestContinue}
            type="button"
            className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-medium text-xs transition flex items-center justify-center gap-2"
          >
            <UserCheck className="h-4 w-4 text-emerald-400" />
            Continue as Guest (Explore Storefront)
          </button>
        </div>
      </div>
    </main>
  );
}