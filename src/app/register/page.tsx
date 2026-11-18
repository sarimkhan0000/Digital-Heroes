'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer',
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && companyName.trim()) {
      await supabase
        .from('profiles')
        .update({ company_name: companyName.trim() })
        .eq('id', data.user.id);
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="border border-[#141413] bg-white p-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="mt-1 text-xs text-[#141413]/65">
          Save custom artwork templates, review digital proofs, and download VAT invoices
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-[#141413]/75">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3.5 py-2.5 text-sm focus:border-[#141413] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-[#141413]/75">
              Company / Race Club (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3.5 py-2.5 text-sm focus:border-[#141413] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-[#141413]/75">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3.5 py-2.5 text-sm focus:border-[#141413] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-[#141413]/75">
              Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3.5 py-2.5 text-sm focus:border-[#141413] focus:bg-white focus:outline-none"
            />
          </div>

          {error && (
            <div className="border border-red-600 bg-red-50 p-3 text-xs font-medium text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#E85D04] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#cf5102] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
            <ArrowRight className="h-4 w-4"/>
          </button>
        </form>

        <p className="mt-6 border-t border-[#141413]/10 pt-4 text-center text-xs text-[#141413]/70">
          Already registered?{' '}
          <Link className="font-semibold text-[#141413] underline decoration-[#E85D04]" href="/login">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}