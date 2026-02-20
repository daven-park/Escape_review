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
