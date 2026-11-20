"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
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
          setErrorMsg(data.error || "Could not load order details.");
        } else {
          setOrder(data.order);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Network error while loading order.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, router]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setConfirmed(true);
    }, 500);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-300 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          Loading order details...
        </div>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Production Order Saved!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your order{" "}
            <span className="text-white font-mono font-semibold">
              {order?.order_number || "#DH-ORDER"}
            </span>{" "}
            is now saved under your account and ready in your dashboard.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#E85D04] hover:bg-[#cf5102] text-white font-semibold text-sm transition"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Digital Heroes Web-to-Print
            </span>
            <h1 className="text-2xl font-bold mt-1">
              Order Summary &amp; Confirmation
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-slate-300 hover:text-white underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {order ? (
          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-400 block">Order Number</span>
                <span className="font-mono font-bold text-sm text-white">
                  {order.order_number}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Division &amp; Material</span>
                <span className="font-semibold text-white">
                  {order.division_slug} — {order.material_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Dimensions &amp; Quantity</span>
                <span className="font-mono text-white">
                  {order.width_mm} × {order.height_mm} mm • {order.quantity} units
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total (inc. VAT)</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  £{Number(order.total_inc_vat).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={confirming}
              className="w-full py-3.5 rounded-xl bg-[#E85D04] hover:bg-[#cf5102] text-white font-semibold text-sm transition disabled:opacity-60"
            >
              {confirming ? "Confirming Order..." : "Confirm & View on Dashboard"}
            </button>
          </form>
        ) : (
          !errorMsg && (
            <div className="text-sm text-slate-400 space-y-4">
              <p>
                Configure a print job from a division to create an order linked to your account.
              </p>
              <Link
                href="/#divisions"
                className="inline-block px-5 py-2.5 rounded-lg bg-[#E85D04] text-white text-xs font-bold uppercase tracking-wider"
              >
                Browse Print Divisions
              </Link>
            </div>
          )
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-sm text-slate-300">
          Loading checkout...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
