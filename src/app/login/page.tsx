"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Printer, LogIn, UserPlus, ArrowLeft, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingMode, setLoadingMode] = useState<"login" | "auto" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const getSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setErrorMsg("Supabase environment variables are missing.");
      return null;
    }

    return createBrowserClient(url, key);
  };

  // 1. Sirf Login (Existing account ke liye)
  const handleOnlyLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoadingMode("login");
    setErrorMsg("");
    setInfoMsg("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoadingMode(null);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.session) {
      setErrorMsg(error?.message || "Invalid login credentials.");
      setLoadingMode(null);
      return;
    }

    router.push("/");
    router.refresh();
  };

  // 2. Sign In ya Naya User Auto Sign Up
  const handleLoginOrRegister = async () => {
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoadingMode("auto");
    setErrorMsg("");
    setInfoMsg("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoadingMode(null);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (!signInError && signInData.session) {
      router.push("/");
      router.refresh();
      return;
    }

    const isInvalidCredentials = signInError?.message
      .toLowerCase()
      .includes("invalid login credentials");

    if (isInvalidCredentials) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

      if (signUpError) {
        setErrorMsg(signUpError.message);
        setLoadingMode(null);
        return;
      }

      if (signUpData.session) {
        router.push("/");
        router.refresh();
        return;
      }

      setInfoMsg(
        "Naya account create ho gaya hai! Kripya apna email inbox (ya spam) check karke confirmation link par click karein, uske baad future mein seedha 'Only Login' se sign in kar paayenge."
      );
      setLoadingMode(null);
      return;
    }

    setErrorMsg(signInError?.message || "Sign in failed. Please try again.");
    setLoadingMode(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleOnlyLogin();
  };

  // 🚀 Guest Mode Handler
  const handleGuestContinue = () => {
    router.push("/");
    router.refresh();
  };

  const isBusy = loadingMode !== null;

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition"
          >
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
            Existing users can sign in directly, or new users can register and continue.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Business Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@company.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Option 1: Sirf Existing Account Se Login */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#E85D04] to-amber-600 text-white font-semibold text-sm transition hover:brightness-110 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loadingMode === "login" ? "Logging in..." : "Login (Existing Account)"}
          </button>

          {/* Option 2: Naye User Ke Liye Auto Sign Up / Sign In */}
          <button
            type="button"
            disabled={isBusy}
            onClick={handleLoginOrRegister}
            className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-medium text-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4 text-amber-400" />
            {loadingMode === "auto"
              ? "Please wait..."
              : "New User? Sign In & Create Account"}
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