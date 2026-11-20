"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Printer, LogIn, UserPlus, ArrowLeft, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setErrorMsg("Supabase environment variables are missing.");
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = createBrowserClient(url, key);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Agar Supabase mein Email Confirmation OFF hai toh session turant mil jaata hai
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      // Agar Email Confirmation ON hai toh inbox check karne ka message dikhayein
      setSuccessMsg(
        "Account created! Please check your email inbox to confirm your account, then sign in."
      );
      setIsSignUp(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
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

        {/* Sign In / Create Account Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition ${
              !isSignUp
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition ${
              isSignUp
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Create Client Account" : "Client Sign In"}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isSignUp
              ? "Register with your business email to access the portal."
              : "Access your pre-press portal and order history."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
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
              minLength={6}
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
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
              ? "Create Account"
              : "Sign In to Portal"}
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