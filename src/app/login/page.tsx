'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';

function DashboardContent() {
  const [userEmail] = useState('customer@digitalheroes.com');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#141413]">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-[#141413]/75">
            Welcome back, <span className="font-semibold">{userEmail}</span>
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-[#141413] text-white text-sm font-medium rounded hover:bg-black transition-colors"
        >
          Back to Store
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-[#141413]/10 shadow-sm rounded-lg">
          <h3 className="text-sm font-semibold text-[#141413]/60 uppercase tracking-wider">Active Orders</h3>
          <p className="text-3xl font-extrabold mt-2 text-[#E85D04]">2</p>
        </div>
        <div className="bg-white p-6 border border-[#141413]/10 shadow-sm rounded-lg">
          <h3 className="text-sm font-semibold text-[#141413]/60 uppercase tracking-wider">Saved Prints</h3>
          <p className="text-3xl font-extrabold mt-2 text-[#141413]">5</p>
        </div>
        <div className="bg-white p-6 border border-[#141413]/10 shadow-sm rounded-lg">
          <h3 className="text-sm font-semibold text-[#141413]/60 uppercase tracking-wider">Account Status</h3>
          <p className="text-sm font-bold mt-3 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
            Verified Customer
          </p>
        </div>
      </div>

      <div className="bg-white p-6 border border-[#141413]/10 shadow-sm rounded-lg">
        <h2 className="text-xl font-bold text-[#141413] mb-4">Recent Orders</h2>
        <div className="border-t border-[#141413]/10 divide-y divide-[#141413]/10">
          <div className="py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-[#141413]">Order #DH-948210</p>
              <p className="text-sm text-[#141413]/70">Custom Web-to-Print Canvas Poster</p>
            </div>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded">Processing</span>
          </div>
          <div className="py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-[#141413]">Order #DH-812394</p>
              <p className="text-sm text-[#141413]/70">Business Flyer Pack (500 pcs)</p>
            </div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded">Delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] p-8">
      <Suspense fallback={<div className="text-center py-12 text-[#141413] font-medium">Loading dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}