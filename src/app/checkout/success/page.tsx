'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, LayoutDashboard, PlusCircle } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || 'CONFIRMED';

  useEffect(() => {
    router.refresh();
  }, [router]);

  const handleGoDashboard = () => {
    router.refresh();
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-100 shadow-xl">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white">
        Print Job Confirmed
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Your order has been logged and queued for production review.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 font-mono text-xs">
        <span className="text-zinc-400">ORDER REFERENCE: </span>
        <span className="font-semibold text-white">{orderId}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGoDashboard}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open Dashboard
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          <PlusCircle className="h-4 w-4" />
          New Print Job
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#090d16] px-4 py-14">
      <Suspense fallback={<div className="text-center text-sm text-zinc-400">Loading confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
