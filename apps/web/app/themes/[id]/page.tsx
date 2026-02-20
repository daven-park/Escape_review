import type { ApiResponse, Review, Theme } from '@escape/types';
import { notFound } from 'next/navigation';

import { ReviewList } from '@/components/review/ReviewList';
import { ThemeDetail } from '@/components/theme/ThemeDetail';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ThemeDetailPageProps {
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

async function fetchReviews(themeId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE}/themes/${themeId}/reviews?limit=40`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<Review[]>;
    return payload.data;
  } catch {
    return [];
  }
}

function createDistribution(reviews: Review[]) {
  const total = reviews.length;

  return [5, 4, 3, 2, 1].map((score) => {
    const count = reviews.filter((review) => Math.round(review.rating) === score).length;
    const percent = total > 0 ? (count / total) * 100 : 0;

    return {
      score,
      count,
      percent,
    };
  });
}

export default async function ThemeDetailPage({ params }: ThemeDetailPageProps) {
  const theme = await fetchTheme(params.id);

  if (!theme) {
    notFound();
  }

  const reviews = await fetchReviews(theme.id);
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
      : 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <ThemeDetail
        theme={theme}
        averageRating={averageRating}
        reviewCount={reviewCount}
        ratingDistribution={createDistribution(reviews)}
      />

      <ReviewList themeId={theme.id} reviews={reviews} />
    </main>
  );
}
