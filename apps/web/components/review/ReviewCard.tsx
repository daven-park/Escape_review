import type { Review } from '@escape/types';
import Image from 'next/image';

import { LikeButton } from '@/components/common/LikeButton';
import { StarRating } from '@/components/review/StarRating';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  themeId: string;
  review: Review;
}

export function ReviewCard({ themeId, review }: ReviewCardProps) {
  return (
    <article className="space-y-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-ink-100">
            {review.user.avatar ? (
              <Image src={review.user.avatar} alt={review.user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-ink-600">
                {review.user.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{review.user.name}</p>
            <p className="text-xs text-ink-500">플레이 일자: {formatDate(review.playedAt)}</p>
          </div>
        </div>

        <LikeButton
          themeId={themeId}
          reviewId={review.id}
          initialLiked={review.isLiked}
          initialLikeCount={review.likeCount}
        />
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <StarRating value={review.rating} readOnly />
        {review.spoilerWarning ? (
          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
            스포일러 포함
          </span>
        ) : null}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-ink-700">{review.content}</p>

      {review.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {review.images.slice(0, 5).map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg bg-ink-100">
              <Image src={image} alt={`리뷰 이미지 ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
