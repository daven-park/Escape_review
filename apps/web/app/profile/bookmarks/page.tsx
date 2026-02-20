'use client';

import Image from 'next/image';
import Link from 'next/link';

import { BookmarkButton } from '@/components/common/BookmarkButton';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarksPage() {
  const { data, isLoading, isError } = useBookmarks({ limit: 50 });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-900">내 북마크</h1>
        <p className="text-sm text-ink-500">저장한 테마를 다시 확인하고 바로 상세 페이지로 이동할 수 있습니다.</p>
      </header>

      {isLoading ? <p className="text-sm text-ink-500">북마크를 불러오는 중...</p> : null}
      {isError ? <p className="text-sm text-rose-600">북마크를 불러오지 못했습니다.</p> : null}

      {!isLoading && (data?.data.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white/80 p-10 text-center text-ink-500">
          저장한 북마크가 없습니다.
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.data ?? []).map((bookmark) => (
          <article key={bookmark.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            <div className="relative aspect-[4/5] bg-ink-100">
              {bookmark.theme.posterUrl ? (
                <Image
                  src={bookmark.theme.posterUrl}
                  alt={bookmark.theme.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-300 to-coral-300 text-3xl font-semibold text-white">
                  {bookmark.theme.name.slice(0, 1)}
                </div>
              )}

              <div className="absolute right-3 top-3">
                <BookmarkButton themeId={bookmark.theme.id} initialBookmarked />
              </div>
            </div>

            <div className="space-y-2 p-4">
              <Link
                href={`/themes/${bookmark.theme.id}`}
                className="text-lg font-semibold text-ink-900 hover:text-brand-700"
              >
                {bookmark.theme.name}
              </Link>
              <p className="text-sm text-ink-500">{bookmark.theme.store.name}</p>
              <p className="text-xs text-ink-600">난이도 {bookmark.theme.difficulty}/5</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
