'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Check Guest Mode
    const guestFlag = localStorage.getItem('dh_guest_mode') === 'true';
    setIsGuest(guestFlag);

    // 2. Check Saved Theme (Dark/Light)
    const savedTheme = localStorage.getItem('dh_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }

    // 3. Check Supabase Auth
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem('dh_guest_mode');
        setIsGuest(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('dh_theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('dh_theme', 'dark');
      setIsDark(true);
    }
  };

  const enterGuestMode = () => {
    localStorage.setItem('dh_guest_mode', 'true');
    setIsGuest(true);
    router.push('/#divisions');
  };

  const exitGuestMode = () => {
    localStorage.removeItem('dh_guest_mode');
    setIsGuest(false);
    router.refresh();
  };

  return (
    <header className="border-b border-[#141413] bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-bold text-lg text-[#141413]">
          DIGITAL HEROES
        </Link>

        <div className="flex items-center gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="border border-[#141413] bg-[#F5F4F0] p-2 text-[#141413] hover:bg-[#E85D04] hover:text-white transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="border border-[#141413] bg-[#F5F4F0] px-4 py-2 text-xs font-bold text-[#141413]"
            >
              Dashboard
            </Link>
          ) : isGuest ? (
            <div className="flex items-center gap-3">
              <span className="border border-[#141413] bg-[#F5F4F0] px-3 py-1.5 font-mono text-xs font-bold text-[#141413]">
                GUEST SESSION
              </span>
              <Link
                href="/register"
                className="bg-[#E85D04] px-3 py-1.5 text-xs font-bold text-white"
              >
                Save Account
              </Link>
              <button
                onClick={exitGuestMode}
                className="text-xs font-bold text-[#141413]/70 hover:text-[#141413]"
              >
                Exit
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={enterGuestMode}
                className="border border-[#141413] bg-[#F5F4F0] px-3 py-2 text-xs font-bold text-[#141413] hover:bg-[#141413] hover:text-white transition-colors"
              >
                Guest Mode
              </button>
              <Link href="/login" className="text-xs font-bold text-[#141413] hover:text-[#E85D04]">
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-[#E85D04] px-4 py-2 text-xs font-bold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}