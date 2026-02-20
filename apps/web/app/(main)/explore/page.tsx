import type { ApiResponse, Region, Store } from '@escape/types';

import { RegionFilter } from '@/components/common/RegionFilter';
import { StoreGrid } from '@/components/store/StoreGrid';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ExplorePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

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

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const selectedRegionIdRaw = searchParams?.regionId;
  const selectedRegionId = Array.isArray(selectedRegionIdRaw)
    ? selectedRegionIdRaw[0]
    : selectedRegionIdRaw;

  const [regionsResult, storesResult] = await Promise.all([
    safeFetch<ApiResponse<Region[]>>('/regions?limit=20', 300),
    safeFetch<ApiResponse<Store[]>>(
      selectedRegionId
        ? `/stores?regionId=${encodeURIComponent(selectedRegionId)}&limit=30`
        : '/stores?limit=30',
      120,
    ),
  ]);

  const regions = regionsResult?.data ?? [];
  const stores = storesResult?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-900">지역/매장 탐색</h1>
        <p className="text-sm text-ink-500">원하는 지역을 선택하고 가까운 방탈출 매장을 찾아보세요.</p>
      </header>

      <RegionFilter regions={regions} selectedRegionId={selectedRegionId} />
      <StoreGrid stores={stores} />
    </div>
  );
}
