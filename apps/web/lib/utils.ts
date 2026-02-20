export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatRating(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : value.toFixed(1);
}

export function difficultyToText(value: number): string {
  if (value <= 1) {
    return '매우 쉬움';
  }

  if (value <= 2) {
    return '쉬움';
  }

  if (value <= 3) {
    return '보통';
  }

  if (value <= 4) {
    return '어려움';
  }

  return '매우 어려움';
}

export function createStars(value: number, max = 5): string {
  const safe = Math.max(0, Math.min(max, value));
  const full = Math.floor(safe);
  const half = safe - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;

  return `${'★'.repeat(full)}${half ? '☆' : ''}${'·'.repeat(Math.max(0, empty))}`;
}
