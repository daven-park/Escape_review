'use client';

import type { Region } from '@escape/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

interface RegionFilterProps {
  regions: Array<Pick<Region, 'id' | 'name'>>;
  selectedRegionId?: string;
  onChange?: (regionId?: string) => void;
}

export function RegionFilter({ regions, selectedRegionId, onChange }: RegionFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selectRegion(regionId?: string) {
    if (onChange) {
      onChange(regionId);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (regionId) {
      params.set('regionId', regionId);
    } else {
      params.delete('regionId');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => selectRegion(undefined)}
        className={cn(
          'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
          !selectedRegionId
            ? 'border-brand-500 bg-brand-500 text-white'
            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
        )}
      >
        전체
      </button>

      {regions.map((region) => {
        const selected = selectedRegionId === region.id;

        return (
          <button
            key={region.id}
            type="button"
            onClick={() => selectRegion(region.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              selected
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
            )}
          >
            {region.name}
          </button>
        );
      })}
    </div>
  );
}
