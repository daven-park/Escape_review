'use client';

import type { User } from '@escape/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useBookmarks } from '@/hooks/useBookmarks';
import { getCurrentUser } from '@/lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const { data: bookmarkResult, isLoading } = useBookmarks({ limit: 4 });

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-ink-900">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-ink-500">프로필과 북마크를 보려면 먼저 로그인하세요.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            로그인하기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">My Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900">{user.name}</h1>
        <p className="text-sm text-ink-500">{user.email}</p>
        <p className="mt-1 text-xs text-ink-400">가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink-900">최근 북마크</h2>
          <Link href="/profile/bookmarks" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            전체 보기
          </Link>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-ink-500">불러오는 중...</p> : null}

        {!isLoading && (bookmarkResult?.data.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-ink-500">아직 북마크한 테마가 없습니다.</p>
        ) : null}

        <ul className="mt-4 space-y-3">
          {(bookmarkResult?.data ?? []).map((bookmark) => (
            <li key={bookmark.id} className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
              <Link href={`/themes/${bookmark.theme.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                {bookmark.theme.name}
              </Link>
              <p className="text-xs text-ink-500">{bookmark.theme.store.name}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
