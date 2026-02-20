'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToggleLike } from '@/hooks/useReviews';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  themeId: string;
  reviewId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
}

export function LikeButton({
  themeId,
  reviewId,
  initialLiked = false,
  initialLikeCount = 0,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const toggleLike = useToggleLike(themeId);

  async function onToggle() {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    const result = await toggleLike.mutateAsync(reviewId);
    setLiked(result.liked);
    setLikeCount(result.likeCount);
  }

  return (
    <button
      type="button"
      onClick={() => {
        void onToggle();
      }}
      disabled={toggleLike.isPending}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        liked
          ? 'border-coral-500 bg-coral-500/10 text-coral-700'
          : 'border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700',
      )}
    >
      <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
      좋아요 {likeCount}
    </button>
  );
}
