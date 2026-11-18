'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Redirect to checkout success page with generated order ID
    const orderId = 'DH-' + Math.floor(100000 + Math.random() * 900000);
    router.push(`/checkout/success?order_id=${orderId}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 border border-[#141413]/10 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-[#141413] mb-6">Complete Your Order</h1>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#141413] mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-[#141413]/20 rounded focus:outline-none focus:border-[#141413]"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#141413] mb-1">Shipping Address</label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border border-[#141413]/20 rounded focus:outline-none focus:border-[#141413]"
            placeholder="Enter delivery address"
          />
        </div>

        <div className="pt-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="px-4 py-2.5 border border-[#141413]/20 text-[#141413] rounded font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#E85D04] text-white py-2.5 rounded font-semibold hover:bg-[#d15203] transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm & Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] py-12 px-4">
      <Suspense fallback={<div className="text-center text-[#141413] font-medium">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}