import type { Review } from '@escape/types';

export const mockReview: Review = {
  id: 'review-1',
  userId: 'user-1',
  themeId: 'theme-1',
  rating: 4.5,
  content: '정말 재미있었어요! 연출과 문제 구성이 모두 만족스러웠습니다.',
  images: ['https://example.com/review-1.jpg'],
  difficulty: 'HARD',
  playedAt: '2024-03-15',
  spoilerWarning: false,
  createdAt: '2024-03-15T00:00:00.000Z',
  user: {
    id: 'user-1',
    name: '테스트 유저',
    avatar: null,
  },
  likeCount: 3,
  isLiked: false,
};
