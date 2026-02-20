'use client';

import { LogOut, MapPin, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { clearSession, getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/explore', label: '탐색', icon: MapPin },
  { href: '/search', label: '검색', icon: Search },
  { href: '/profile', label: '프로필', icon: UserRound },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(getCurrentUser()?.name ?? null);
  }, []);

  const authLink = useMemo(() => {
    if (userName) {
      return { href: '/profile', label: userName };
    }

    return { href: '/login', label: '로그인' };
  }, [userName]);

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors and clear local session regardless.
    }

    clearSession();
    setUserName(null);
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            ER
          </span>
          Escape Review
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={authLink.href}
            className="rounded-lg border border-ink-100 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-900"
          >
            {authLink.label}
          </Link>
          {userName ? (
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
