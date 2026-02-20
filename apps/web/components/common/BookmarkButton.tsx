'use client';

import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToggleBookmark } from '@/hooks/useBookmarks';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  themeId: string;
  initialBookmarked?: boolean;
  className?: string;
}

export function BookmarkButton({
  themeId,
  initialBookmarked = false,
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const toggleBookmark = useToggleBookmark();

  async function onToggle() {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    const result = await toggleBookmark.mutateAsync(themeId);
    setBookmarked(result.bookmarked);
  }

  return (
    <button
      type="button"
      aria-label="북마크"
      onClick={() => {
        void onToggle();
      }}
      disabled={toggleBookmark.isPending}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
        bookmarked
          ? 'border-coral-500 bg-coral-500/10 text-coral-700'
          : 'border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-700',
        className,
      )}
    >
      <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
    </button>
  );
}
