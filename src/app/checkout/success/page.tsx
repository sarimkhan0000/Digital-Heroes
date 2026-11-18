'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('session_id') || 'DH-' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-[#141413]/10 shadow-sm text-center">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-[#141413]">Order Placed Successfully!</h1>
      <p className="mt-2 text-sm text-[#141413]/70">
        Thank you for your purchase. Your digital print order has been confirmed.
      </p>
      
      <div className="mt-6 p-4 bg-[#F5F4F0] rounded text-left text-sm text-[#141413]">
        <p><span className="font-semibold">Order ID:</span> {orderId}</p>
        <p className="mt-1"><span className="text-emerald-700 font-medium">Status:</span> Processing &amp; Verification</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/"
          className="w-full bg-[#141413] text-white py-3 rounded font-medium hover:bg-black transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-[#141413] font-medium">Loading order details...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}