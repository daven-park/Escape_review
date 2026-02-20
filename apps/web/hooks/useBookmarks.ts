'use client';

import type { ApiResponse, BookmarkedTheme, ToggleBookmarkResponse } from '@escape/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface BookmarkOptions {
  limit?: number;
  cursor?: string;
}

function buildBookmarkPath(options: BookmarkOptions): string {
  const searchParams = new URLSearchParams();

  if (typeof options.limit === 'number') {
    searchParams.set('limit', String(options.limit));
  }

  if (options.cursor) {
    searchParams.set('cursor', options.cursor);
  }

  const query = searchParams.toString();
  return query ? `/users/me/bookmarks?${query}` : '/users/me/bookmarks';
}

export function useBookmarks(options: BookmarkOptions = {}) {
  const hasToken = Boolean(getAccessToken());

  return useQuery({
    queryKey: ['bookmarks', options],
    queryFn: () => api.get<ApiResponse<BookmarkedTheme[]>>(buildBookmarkPath(options)),
    enabled: hasToken,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (themeId: string) => api.post<ToggleBookmarkResponse>('/bookmarks', { themeId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
