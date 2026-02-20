import axios, { AxiosError, AxiosHeaders } from 'axios';
import { getAccessToken } from './auth';

export interface PaginationMeta {
  page?: number;
  total?: number;
  cursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T;
  meta: PaginationMeta;
  error: ApiError | null;
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (!token) {
    return config;
  }

  config.headers = config.headers ?? new AxiosHeaders();
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
