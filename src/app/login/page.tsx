'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Invalid credentials');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin' && !searchParams.get('redirect')) {
      router.push('/admin');
    } else {
      router.push(redirectTo);
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="border border-[#141413] bg-white p-8">
        <div className="flex items-center justify-between border-b border-[#141413]/15 pb-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Sign In</h1>
            <p className="mt-1 text-xs text-[#141413]/65">
              Access your print workspace, proofs &amp; production queue
            </p>
          </div>
          <Lock className="h-5 w-5 text-[#E85D04]"/>
        </div>

        {/* Evaluator Quick-Fill Credentials */}
        <div className="mt-5 border border-[#141413]/15 bg-[#F5F4F0] p-3.5 text-xs">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413]/60">
            Demo Access Accounts (Password: DigitalHeroes2026!)
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('maker@trailwerks.cc');
                setPassword('DigitalHeroes2026!');
              }}
              className="flex-1 border border-[#141413] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold hover:bg-[#141413] hover:text-white transition-colors"
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('ops@digitalheroes.studio');
                setPassword('DigitalHeroes2026!');
              }}
              className="flex-1 border border-[#141413] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold hover:bg-[#141413] hover:text-white transition-colors"
            >
              Fill Admin Ops
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-[#141413]/75">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] px-3.5 py-2.5 text-sm focus:border-[#141413] focus:bg-white focus:outline-none"
              placeholder="••••••••••••"
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
            {loading ? 'Authenticating...' : 'Continue to Workspace'}
            <ArrowRight className="h-4 w-4"/>
          </button>
        </form>

        <p className="mt-6 border-t border-[#141413]/10 pt-4 text-center text-xs text-[#141413]/70">
          New studio or event organizer?{' '}
          <Link className="font-semibold text-[#141413] underline decoration-[#E85D04]" href="/register">
            Create a customer account
          </Link>
        </p>
      </div>
    </div>
  );
}