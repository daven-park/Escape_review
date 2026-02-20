import type { ApiResponse, Store, Theme } from '@escape/types';
import { Globe, Phone } from 'lucide-react';
import { notFound } from 'next/navigation';

import { ThemeCard } from '@/components/theme/ThemeCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

async function fetchStore(id: string): Promise<Store | null> {
  try {
    const response = await fetch(`${API_BASE}/stores/${id}`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Store;
  } catch {
    return null;
  }
}

async function fetchStoreThemes(storeId: string): Promise<Theme[]> {
  try {
    const response = await fetch(`${API_BASE}/themes?storeId=${encodeURIComponent(storeId)}&limit=40`, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<Theme[]>;
    return payload.data;
  } catch {
    return [];
  }
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const store = await fetchStore(params.id);

  if (!store) {
    notFound();
  }

  const themes = await fetchStoreThemes(store.id);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-ink-900">{store.name}</h1>
        <p className="text-sm text-ink-600">{store.address}</p>

        <div className="flex flex-wrap gap-4 text-sm text-ink-600">
          {store.phone ? (
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {store.phone}
            </p>
          ) : null}
          {store.website ? (
            <a
              href={store.website}
              target="_blank"
              className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800"
            >
              <Globe className="h-4 w-4" />
              홈페이지 바로가기
            </a>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-ink-900">이 매장의 테마</h2>

        {themes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white/80 p-10 text-center text-ink-500">
            등록된 테마가 없습니다.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} storeName={store.name} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
