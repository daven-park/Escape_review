import { SearchX } from 'lucide-react';

import { StoreCard } from '@/components/store/StoreCard';
import { ThemeCard } from '@/components/theme/ThemeCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

type SearchType = 'theme' | 'store' | 'all';

interface SearchThemeItem {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string;
  genre: 'HORROR' | 'THRILLER' | 'SF' | 'FANTASY' | 'MYSTERY' | 'ROMANCE' | 'ADVENTURE' | 'OTHER';
  difficulty: number;
  posterUrl: string | null;
}

interface SearchStoreItem {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
  regionId: string;
}

interface SearchResponse {
  data: {
    themes: SearchThemeItem[];
    stores: SearchStoreItem[];
  };
  meta: {
    q: string;
    type: SearchType;
  };
  error: null;
}

interface SearchPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

async function search(query: string, type: SearchType): Promise<SearchResponse | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${API_BASE}/search?q=${encodedQuery}&type=${type}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SearchResponse;
  } catch {
    return null;
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const qRaw = searchParams?.q;
  const typeRaw = searchParams?.type;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw)?.trim() ?? '';
  const type = (Array.isArray(typeRaw) ? typeRaw[0] : typeRaw) as SearchType | undefined;
  const safeType: SearchType = type === 'theme' || type === 'store' || type === 'all' ? type : 'all';

  const result = q ? await search(q, safeType) : null;
  const themes = result?.data.themes ?? [];
  const stores = result?.data.stores ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-ink-900">검색</h1>

        <form className="grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 sm:grid-cols-[1fr_140px_120px]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="테마명/매장명 검색"
            className="h-11 rounded-xl border border-ink-200 px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <select
            name="type"
            defaultValue={safeType}
            className="h-11 rounded-xl border border-ink-200 px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">전체</option>
            <option value="theme">테마</option>
            <option value="store">매장</option>
          </select>
          <button className="h-11 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700">
            검색
          </button>
        </form>
      </header>

      {!q ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white/80 p-12 text-center text-ink-500">
          검색어를 입력해 주세요.
        </div>
      ) : null}

      {q && themes.length === 0 && stores.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-300 bg-white/80 p-12 text-center text-ink-500">
          <SearchX className="h-6 w-6" />
          검색 결과가 없습니다.
        </div>
      ) : null}

      {themes.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink-900">테마 결과 ({themes.length})</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={{
                  ...theme,
                  playerMin: 2,
                  playerMax: 6,
                  duration: 60,
                  fearLevel: 3,
                  createdAt: new Date().toISOString(),
                  bookingUrl: undefined,
                  posterUrl: theme.posterUrl ?? undefined,
                }}
                storeName={theme.storeName}
              />
            ))}
          </div>
        </section>
      ) : null}

      {stores.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink-900">매장 결과 ({stores.length})</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={{
                  ...store,
                  phone: undefined,
                  website: undefined,
                  imageUrl: store.imageUrl ?? undefined,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
