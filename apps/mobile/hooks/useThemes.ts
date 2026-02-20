import { useQuery } from '@tanstack/react-query';
import { ApiResponse, apiClient } from '../lib/api';

export type Genre =
  | 'HORROR'
  | 'THRILLER'
  | 'SF'
  | 'FANTASY'
  | 'MYSTERY'
  | 'ROMANCE'
  | 'ADVENTURE'
  | 'OTHER';

export interface Theme {
  id: string;
  storeId: string;
  name: string;
  description: string;
  genre: Genre;
  difficulty: number;
  playerMin: number;
  playerMax: number;
  duration: number;
  bookingUrl?: string;
  posterUrl?: string;
  fearLevel: number;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  regionId: string;
  address: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function useFeaturedThemes() {
  return useQuery({
    queryKey: ['themes', 'featured'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Theme[]>>('/themes', {
        params: { sort: 'popular', limit: 20 },
      });
      return response.data.data;
    },
  });
}

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Theme>>(`/themes/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useSearchThemes(keyword: string) {
  return useQuery({
    queryKey: ['themes', 'search', keyword],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Theme[]>>('/themes', {
        params: { q: keyword, limit: 20 },
      });
      return response.data.data;
    },
    enabled: keyword.trim().length > 0,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Store>>(`/stores/${id}`);
      return response.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useStoresByRegion(region?: string) {
  return useQuery({
    queryKey: ['stores', 'region', region],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Store[]>>('/stores', {
        params: region ? { region } : undefined,
      });
      return response.data.data;
    },
  });
}

export function useThemesByStore(storeId: string) {
  return useQuery({
    queryKey: ['stores', storeId, 'themes'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Theme[]>>(`/stores/${storeId}/themes`);
      return response.data.data;
    },
    enabled: Boolean(storeId),
  });
}
