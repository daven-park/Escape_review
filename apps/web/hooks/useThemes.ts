'use client';

import type { ApiResponse, Genre, Theme } from '@escape/types';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export interface ThemeListParams {
  storeId?: string;
  genre?: Genre;
  difficulty?: number;
  limit?: number;
  cursor?: string;
}

function buildQuery(params: ThemeListParams): string {
  const searchParams = new URLSearchParams();

  if (params.storeId) {
    searchParams.set('storeId', params.storeId);
  }

  if (params.genre) {
    searchParams.set('genre', params.genre);
  }

  if (typeof params.difficulty === 'number') {
    searchParams.set('difficulty', String(params.difficulty));
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const query = searchParams.toString();
  return query ? `/themes?${query}` : '/themes';
}

export function useThemes(params: ThemeListParams = {}) {
  return useQuery({
    queryKey: ['themes', params],
    queryFn: () => api.get<ApiResponse<Theme[]>>(buildQuery(params)),
  });
}

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: () => api.get<Theme>(`/themes/${id}`),
    enabled: Boolean(id),
  });
}
