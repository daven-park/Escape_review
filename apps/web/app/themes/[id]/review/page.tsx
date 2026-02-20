import type { Theme } from '@escape/types';
import { notFound } from 'next/navigation';

import { ReviewForm } from '@/components/review/ReviewForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ThemeReviewWritePageProps {
  params: {
    id: string;
  };
}

async function fetchTheme(id: string): Promise<Theme | null> {
  try {
    const response = await fetch(`${API_BASE}/themes/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Theme;
  } catch {
    return null;
  }
}

export default async function ThemeReviewWritePage({ params }: ThemeReviewWritePageProps) {
  const theme = await fetchTheme(params.id);

  if (!theme) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-ink-900">{theme.name} 리뷰 작성</h1>
        <p className="text-sm text-ink-500">플레이 경험을 상세히 남겨 다른 유저에게 도움을 주세요.</p>
      </header>

      <ReviewForm themeId={theme.id} />
    </main>
  );
}
