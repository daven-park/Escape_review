import type { Genre } from '@escape/types';

import { cn } from '@/lib/utils';

interface GenreBadgeProps {
  genre: Genre;
}

const genreLabel: Record<Genre, string> = {
  HORROR: '호러',
  THRILLER: '스릴러',
  SF: 'SF',
  FANTASY: '판타지',
  MYSTERY: '미스터리',
  ROMANCE: '로맨스',
  ADVENTURE: '어드벤처',
  OTHER: '기타',
};

const genreClass: Record<Genre, string> = {
  HORROR: 'bg-rose-50 text-rose-700 border-rose-200',
  THRILLER: 'bg-orange-50 text-orange-700 border-orange-200',
  SF: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  FANTASY: 'bg-violet-50 text-violet-700 border-violet-200',
  MYSTERY: 'bg-blue-50 text-blue-700 border-blue-200',
  ROMANCE: 'bg-pink-50 text-pink-700 border-pink-200',
  ADVENTURE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function GenreBadge({ genre }: GenreBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        genreClass[genre],
      )}
    >
      {genreLabel[genre]}
    </span>
  );
}
