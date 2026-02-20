import type { Theme } from '@escape/types';
import { Clock3, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { BookmarkButton } from '@/components/common/BookmarkButton';
import { GenreBadge } from '@/components/theme/GenreBadge';
import { cn, difficultyToText } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  storeName?: string;
  className?: string;
}

export function ThemeCard({ theme, storeName, className }: ThemeCardProps) {
  return (
    <article className={cn('overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft', className)}>
      <div className="relative aspect-[4/5] bg-ink-100">
        {theme.posterUrl ? (
          <Image src={theme.posterUrl} alt={theme.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-300 to-coral-300 text-3xl font-semibold text-white">
            {theme.name.slice(0, 1)}
          </div>
        )}

        <div className="absolute right-3 top-3">
          <BookmarkButton themeId={theme.id} />
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/themes/${theme.id}`} className="line-clamp-1 text-lg font-semibold text-ink-900 hover:text-brand-700">
              {theme.name}
            </Link>
            {storeName ? <p className="text-xs text-ink-500">{storeName}</p> : null}
          </div>
          <GenreBadge genre={theme.genre} />
        </div>

        <p className="line-clamp-2 text-sm text-ink-600">{theme.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-ink-600">
          <div className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {theme.playerMin} - {theme.playerMax}인
          </div>
          <div className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {theme.duration}분
          </div>
        </div>

        <p className="text-xs font-medium text-brand-700">난이도 {theme.difficulty}/5 ({difficultyToText(theme.difficulty)})</p>

        <Link
          href={`/themes/${theme.id}`}
          className="inline-flex rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          테마 상세 보기
        </Link>
      </div>
    </article>
  );
}
