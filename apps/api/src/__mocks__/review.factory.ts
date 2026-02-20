import { ReviewEntity } from '../reviews/reviews.repository';

export function createMockReview(overrides: Partial<ReviewEntity> = {}): ReviewEntity {
  const now = '2024-03-15T00:00:00.000Z';

  return {
    id: 'review-1',
    userId: 'user-1',
    themeId: 'theme-1',
    rating: 4.5,
    content: '정말 재미있었어요! 다음에도 다시 방문하고 싶습니다.',
    images: ['https://example.com/review-1.jpg'],
    difficulty: 'HARD',
    playedAt: '2024-03-15',
    spoilerWarning: false,
    createdAt: now,
    updatedAt: now,
    user: {
      id: 'user-1',
      name: '테스트 유저',
      avatar: null,
    },
    likeCount: 0,
    ...overrides,
  };
}
