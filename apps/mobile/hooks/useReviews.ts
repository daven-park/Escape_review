import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { ApiResponse, apiClient } from '../lib/api';

export type DifficultyLabel = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

export interface Review {
  id: string;
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: DifficultyLabel;
  playedAt: string;
  spoilerWarning: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  likeCount: number;
  isLiked?: boolean;
}

export interface ReviewFormInput {
  rating: number;
  content: string;
  images?: string[];
  difficulty: DifficultyLabel;
  playedAt: string;
  spoilerWarning?: boolean;
}

interface ReviewPage {
  items: Review[];
  nextPage?: number;
}

const PAGE_SIZE = 10;

export function useInfiniteReviews(themeId: string) {
  return useInfiniteQuery({
    queryKey: ['reviews', themeId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<ReviewPage> => {
      const response = await apiClient.get<ApiResponse<Review[]>>('/reviews', {
        params: {
          themeId,
          page: pageParam,
          limit: PAGE_SIZE,
        },
      });
      const items = response.data.data;
      return {
        items,
        nextPage: items.length < PAGE_SIZE ? undefined : Number(pageParam) + 1,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(themeId),
  });
}

export function useCreateReview(themeId: string) {
  return useMutation({
    mutationFn: async (payload: ReviewFormInput) => {
      const response = await apiClient.post<ApiResponse<Review>>('/reviews', {
        ...payload,
        themeId,
      });
      return response.data.data;
    },
  });
}

export function useUpdateReview(reviewId: string) {
  return useMutation({
    mutationFn: async (payload: Partial<ReviewFormInput>) => {
      const response = await apiClient.patch<ApiResponse<Review>>(`/reviews/${reviewId}`, payload);
      return response.data.data;
    },
  });
}
