"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Production Order Confirmed!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your custom print & fabrication job has been queued into the Digital
            Heroes pre-press pipeline. Order reference:{" "}
            <span className="text-white font-mono font-semibold">
              #DH-{Math.floor(100000 + Math.random() * 900000)}
            </span>
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition"
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Digital Heroes Web-to-Print
            </span>
            <h1 className="text-3xl font-bold mt-1">
              Production Checkout & Dispatch
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Configurator
          </Link>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-2 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold border-b border-slate-800 pb-3">
              1. Client & Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Full Name / Contact Person *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Business Email *
                </label>
                <input
                  required
                  type="email"
                  placeholder="client@company.com"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="Company Ltd."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+44 7700 900077"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Shipping / Freight Address *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Street address, Industrial Estate, City, Postcode"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Pre-Press & Artwork Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="CMYK profile, bleed instructions, or dispatch notes"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-slate-800 pb-3">
                2. Job Summary
              </h2>
              <div className="text-sm space-y-2.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Production Spec</span>
                  <span className="font-medium text-white">Custom W2P Run</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pre-Press Check</span>
                  <span className="text-emerald-400 font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VAT Rate</span>
                  <span>20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Turnaround</span>
                  <span>2–4 Working Days</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg"
              >
                {loading ? "Submitting Production Order..." : "Confirm & Place Order"}
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Encrypted checkout • Instant pre-press job ticket generation
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}