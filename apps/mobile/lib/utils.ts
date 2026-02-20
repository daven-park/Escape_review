import { isAxiosError } from './api';

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function toErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (typeof responseData === 'object' && responseData !== null && 'error' in responseData) {
      const apiError = (responseData as { error?: { message?: string } }).error;
      if (apiError?.message) {
        return apiError.message;
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}
