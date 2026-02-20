import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReviewCard } from '@/components/review/ReviewCard';

import { mockReview } from './__mocks__/review';

vi.mock('next/image', () => ({
  default: (props: {
    src: string;
    alt: string;
    className?: string;
  }) => <img src={props.src} alt={props.alt} className={props.className} />,
}));

vi.mock('@/components/common/LikeButton', () => ({
  LikeButton: () => <button type="button">좋아요 버튼</button>,
}));

describe('ReviewCard', () => {
  it('renders review content and user info', () => {
    render(<ReviewCard themeId="theme-1" review={mockReview} />);

    expect(screen.getByText(mockReview.user.name)).toBeTruthy();
    expect(screen.getByText(mockReview.content)).toBeTruthy();
    expect(screen.getByText('좋아요 버튼')).toBeTruthy();
  });

  it('shows spoiler badge when spoilerWarning is true', () => {
    render(
      <ReviewCard
        themeId="theme-1"
        review={{
          ...mockReview,
          spoilerWarning: true,
        }}
      />,
    );

    expect(screen.getByText('스포일러 포함')).toBeTruthy();
  });

  it('renders maximum 5 review images', () => {
    render(
      <ReviewCard
        themeId="theme-1"
        review={{
          ...mockReview,
          images: [
            'https://example.com/1.jpg',
            'https://example.com/2.jpg',
            'https://example.com/3.jpg',
            'https://example.com/4.jpg',
            'https://example.com/5.jpg',
            'https://example.com/6.jpg',
          ],
        }}
      />,
    );

    expect(screen.getAllByAltText(/리뷰 이미지/)).toHaveLength(5);
  });
});
