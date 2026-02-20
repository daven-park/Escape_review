import type { ApiResponse, Region, Theme } from '@escape/types';
import Link from 'next/link';

import { RegionFilter } from '@/components/common/RegionFilter';
import { ThemeCard } from '@/components/theme/ThemeCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function safeFetch<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [regionsResult, themesResult] = await Promise.all([
    safeFetch<ApiResponse<Region[]>>('/regions?limit=8', 300),
    safeFetch<ApiResponse<Theme[]>>('/themes?limit=10', 120),
  ]);

  const regions = regionsResult?.data ?? [];
  const trendingThemes = themesResult?.data ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-600 via-brand-500 to-coral-500 px-6 py-10 text-white shadow-soft sm:px-10">
        <p className="text-sm font-medium text-white/80">방탈출 예약/후기 플랫폼</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">오늘의 탈출 테마를 찾아보세요</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
          지역별 매장 탐색부터 테마 리뷰, 북마크까지 한 번에 관리할 수 있습니다.
        </p>

        <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            placeholder="테마명, 매장명, 지역 검색"
            className="h-12 flex-1 rounded-xl border border-white/30 bg-white/95 px-4 text-ink-900 outline-none transition focus:ring-2 focus:ring-white/60"
          />
          <button
            type="submit"
            className="h-12 rounded-xl bg-ink-900 px-6 text-sm font-semibold text-white transition hover:bg-ink-700"
          >
            검색
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink-900">인기 지역</h2>
          <Link href="/explore" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            전체 탐색
          </Link>
        </div>
        <RegionFilter regions={regions} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink-900">지금 인기 테마</h2>
          <Link href="/search?type=theme" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            더 보기
          </Link>
        </div>

        {trendingThemes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white/70 p-10 text-center text-ink-500">
            인기 테마 데이터를 불러오지 못했습니다.
          </div>
        ) : (
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
            {trendingThemes.map((theme) => (
              <div key={theme.id} className="w-[250px] shrink-0 snap-start">
                <ThemeCard theme={theme} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
