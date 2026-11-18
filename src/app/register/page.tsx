'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setMessage('Account created! Please check your email to verify your account.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 border border-[#141413]/10 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-[#141413] mb-2">Create an Account</h1>
      <p className="text-sm text-[#141413]/70 mb-6">Join Digital Heroes to order custom prints</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded border border-emerald-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#141413] mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[#141413]/20 rounded focus:outline-none focus:border-[#141413]"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#141413] mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-[#141413]/20 rounded focus:outline-none focus:border-[#141413]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#141413] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-[#141413]/20 rounded focus:outline-none focus:border-[#141413]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#141413] text-white py-2.5 rounded font-medium hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#141413]/70">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#E85D04] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-[#141413] font-medium">Loading signup...</div>}>
        <SignupFormContent />
      </Suspense>
    </div>
  );
}