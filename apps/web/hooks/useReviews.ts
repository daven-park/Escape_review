'use client';

import type {
  ApiResponse,
  CreateReviewPayload,
  Review,
  ToggleLikeResponse,
  UpdateReviewPayload,
} from '@escape/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';

interface ReviewListOptions {
  limit?: number;
  cursor?: string;
}

function buildReviewQuery(themeId: string, options: ReviewListOptions): string {
  const searchParams = new URLSearchParams();

  if (typeof options.limit === 'number') {
    searchParams.set('limit', String(options.limit));
  }

  if (options.cursor) {
    searchParams.set('cursor', options.cursor);
  }

  const query = searchParams.toString();
  const base = `/themes/${themeId}/reviews`;

  return query ? `${base}?${query}` : base;
}

export function useReviews(themeId: string, options: ReviewListOptions = {}) {
  return useQuery({
    queryKey: ['reviews', themeId, options],
    queryFn: () => api.get<ApiResponse<Review[]>>(buildReviewQuery(themeId, options)),
    enabled: Boolean(themeId),
  });
}

export function useCreateReview(themeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateReviewPayload, 'themeId'> & { themeId?: string }) =>
      api.post<Review>('/reviews', {
        ...payload,
        themeId: payload.themeId ?? themeId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', themeId] });
    },
  });
}

export function useUpdateReview(themeId: string, reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReviewPayload) => api.patch<Review>(`/reviews/${reviewId}`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', themeId] });
    },
  });
}

export function useToggleLike(themeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => api.post<ToggleLikeResponse>(`/reviews/${reviewId}/likes`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', themeId] });
    },
  });
}
