import type { Theme } from '@escape/types';
import { Clock3, ExternalLink, ShieldAlert, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { GenreBadge } from '@/components/theme/GenreBadge';
import { cn, difficultyToText, formatRating } from '@/lib/utils';

interface RatingBucket {
  score: number;
  count: number;
  percent: number;
}

interface ThemeDetailProps {
  theme: Theme;
  averageRating: number;
  reviewCount: number;
  ratingDistribution: RatingBucket[];
}

function difficultyStars(level: number): string {
  return '★'.repeat(Math.max(1, Math.round(level))).padEnd(5, '☆');
}

export function ThemeDetail({
  theme,
  averageRating,
  reviewCount,
  ratingDistribution,
}: ThemeDetailProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
        {theme.posterUrl ? (
          <Image src={theme.posterUrl} alt={theme.name} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-300 to-coral-300 text-5xl font-semibold text-white">
            {theme.name.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <GenreBadge genre={theme.genre} />
          <h1 className="text-3xl font-bold text-ink-900">{theme.name}</h1>
          <p className="text-ink-600">{theme.description}</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-sm text-ink-700 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-600" />
            권장 인원 {theme.playerMin} - {theme.playerMax}명
          </p>
          <p className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-brand-600" />
            플레이 타임 {theme.duration}분
          </p>
          <p className="inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-brand-600" />
            공포도 {theme.fearLevel}/5
          </p>
          <p className="text-brand-700">
            난이도 {difficultyStars(theme.difficulty)} ({difficultyToText(theme.difficulty)})
          </p>
        </div>

        <div className="grid gap-6 rounded-2xl border border-ink-100 bg-white p-5 sm:grid-cols-[180px_1fr]">
          <div>
            <p className="text-sm text-ink-500">평균 평점</p>
            <p className="text-4xl font-bold text-ink-900">{formatRating(averageRating)}</p>
            <p className="text-xs text-ink-500">총 {reviewCount}개 리뷰</p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((bucket) => (
              <div key={bucket.score} className="grid grid-cols-[26px_1fr_32px] items-center gap-2 text-xs">
                <span className="text-ink-600">{bucket.score}점</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={cn('h-full rounded-full bg-brand-500 transition-all')}
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <span className="text-right text-ink-500">{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {theme.bookingUrl ? (
            <Link
              href={theme.bookingUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-700"
            >
              예약하러 가기
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}

          <Link
            href={`/themes/${theme.id}/review`}
            className="inline-flex rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300"
          >
            리뷰 작성하기
          </Link>
        </div>
      </div>
    </section>
  );
}
