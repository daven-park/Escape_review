import type { Store } from '@escape/types';
import { MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
      <Link href={`/stores/${store.id}`} className="block">
        <div className="relative aspect-[16/10] bg-ink-100">
          {store.imageUrl ? (
            <Image src={store.imageUrl} alt={store.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-200 to-coral-300 text-4xl font-semibold text-white">
              {store.name.slice(0, 1)}
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <Link href={`/stores/${store.id}`} className="text-lg font-semibold text-ink-900 hover:text-brand-700">
            {store.name}
          </Link>
          <p className="mt-1 flex items-start gap-2 text-sm text-ink-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {store.address}
          </p>
          {store.phone ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
              <Phone className="h-4 w-4" />
              {store.phone}
            </p>
          ) : null}
        </div>

        <Link
          href={`/stores/${store.id}`}
          className="inline-flex rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          매장 상세 보기
        </Link>
      </div>
    </article>
  );
}
