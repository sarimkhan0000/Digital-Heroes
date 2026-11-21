"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { OrderRecord } from "@/types/database";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(orderId));
  const [confirming, setConfirming] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let active = true;
    fetch(`/api/checkout?orderId=${encodeURIComponent(orderId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (res.status === 401) {
          router.push(`/login?redirect=/checkout?orderId=${encodeURIComponent(orderId)}`);
          return;
        }
        if (!res.ok || !data.order) {
          setErrorMsg(data.error || "Unable to retrieve print job details.");
        } else {
          setOrder(data.order);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Network error while loading print job details.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, router]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    setErrorMsg(null);

    try {
      if (order) {
        router.refresh();
        setConfirmed(true);
        setConfirming(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divisionSlug: "industrial-panels",
          widthMm: 300,
          heightMm: 200,
          quantity: 1,
          sourceType: "CANVAS_DESIGN",
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login?redirect=/checkout");
        return;
      }

      if (!response.ok || !data.order) {
        setErrorMsg(data.error || "Failed to submit print job to production queue.");
        setConfirming(false);
        return;
      }

      setOrder(data.order);
      router.refresh();
      setConfirmed(true);
    } catch {
      setErrorMsg("Network error while submitting print job.");
    } finally {
      setConfirming(false);
    }
  };

  const handleNavigateDashboard = () => {
    router.refresh();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] text-zinc-100 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-zinc-300 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          Loading print job specifications...
        </div>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#090d16] text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Print Job Queued for Production
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Order{" "}
            <span className="text-zinc-100 font-mono font-semibold">
              {order?.order_number || "CONFIRMED"}
            </span>{" "}
            has been recorded under your account and synced with your production dashboard.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleNavigateDashboard}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/#divisions"
              className="px-5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition"
            >
              Configure Another Job
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-zinc-100 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-7 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              Digital Heroes Web-to-Print
            </span>
            <h1 className="text-2xl font-bold mt-1 text-white">
              Print Job Review &amp; Dispatch
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-zinc-400 hover:text-white underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleConfirmOrder} className="space-y-5">
          {order ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-xs">
              <div>
                <span className="text-zinc-400 block">Order Reference</span>
                <span className="font-mono font-bold text-sm text-white">
                  {order.order_number}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Division &amp; Substrate</span>
                <span className="font-semibold text-zinc-100">
                  {order.division_slug} — {order.material_name}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Dimensions &amp; Run Size</span>
                <span className="font-mono text-zinc-200">
                  {order.width_mm} × {order.height_mm} mm • {order.quantity} units
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Total (inc. VAT)</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  £{Number(order.total_inc_vat).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs text-zinc-300 flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                Ready to submit a print job directly to the <span className="font-mono text-white">orders</span> pipeline under your authenticated account, or{" "}
                <Link href="/#divisions" className="text-indigo-400 underline hover:text-indigo-300">
                  configure custom dimensions &amp; substrate
                </Link>{" "}
                first.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={confirming}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition disabled:opacity-60"
          >
            {confirming ? "Submitting Print Job..." : "Confirm & Sync to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090d16] text-zinc-300 flex items-center justify-center p-6 text-sm">
          Loading checkout workspace...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
