"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Printer,
  LogIn,
  UserPlus,
  ArrowLeft,
  UserCheck,
  Building2,
} from "lucide-react";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMsg("");
    setInfoMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.session) {
        setErrorMsg(
          error?.message ||
            "Invalid email or password. If you don't have an account yet, switch to 'Create Account'."
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim() || undefined,
          company_name: companyName.trim() || undefined,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setInfoMsg(
      "Account created! Please check your inbox (or spam folder) for the confirmation link, then switch to 'Sign In' to log in."
    );
    setLoading(false);
  };

  const handleGuestContinue = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-[88vh] flex items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
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

        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              mode === "signin"
                ? "bg-[#E85D04] text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-amber-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Create Account
          </button>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarim Khan"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-500" /> Company (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Ltd"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

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
            {mode === "signup" && (
              <p className="text-[11px] text-slate-500 mt-1">
                Minimum 6 characters required.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm transition hover:brightness-110 shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 ${
              mode === "signin"
                ? "bg-gradient-to-r from-[#E85D04] to-amber-600 shadow-orange-500/20"
                : "bg-gradient-to-r from-amber-600 to-orange-500 shadow-amber-500/20"
            }`}
          >
            {mode === "signin" ? (
              <>
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in..." : "Sign In to Dashboard"}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating account..." : "Create New Account"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3">
            Just want to browse or test the print configurator?
          </p>
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
