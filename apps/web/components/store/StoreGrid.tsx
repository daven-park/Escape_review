import type { Store } from '@escape/types';

import { StoreCard } from './StoreCard';

interface StoreGridProps {
  stores: Store[];
}

export function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-300 bg-white/70 p-10 text-center text-ink-500">
        조건에 맞는 매장이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
