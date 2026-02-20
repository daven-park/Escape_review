'use client';

import type { Review } from '@escape/types';
import { useMemo, useState } from 'react';

import { ReviewCard } from '@/components/review/ReviewCard';

interface ReviewListProps {
  themeId: string;
  reviews: Review[];
}

export function ReviewList({ themeId, reviews }: ReviewListProps) {
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  const sortedReviews = useMemo(() => {
    const copied = [...reviews];

    if (sort === 'popular') {
      copied.sort((a, b) => {
        if (b.likeCount !== a.likeCount) {
          return b.likeCount - a.likeCount;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return copied;
    }

    copied.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return copied;
  }, [reviews, sort]);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-300 bg-white/80 p-10 text-center text-ink-500">
        아직 등록된 리뷰가 없습니다. 첫 리뷰를 남겨보세요.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">리뷰 {reviews.length}개</h2>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as 'latest' | 'popular')}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedReviews.map((review) => (
          <ReviewCard key={review.id} themeId={themeId} review={review} />
        ))}
      </div>
    </section>
  );
}
