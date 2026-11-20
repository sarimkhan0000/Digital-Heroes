"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createBrowserClient(url, key);
      await supabase.auth.signOut();
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 px-3.5 py-2 text-xs font-semibold text-slate-200 transition disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
