import { ThemeEntity } from '../themes/themes.repository';

export function createMockTheme(overrides: Partial<ThemeEntity> = {}): ThemeEntity {
  const now = '2024-03-15T00:00:00.000Z';

  return {
    id: 'theme-1',
    storeId: 'store-1',
    name: '폐병원 탈출',
    description: '긴장감 있는 공포 테마입니다.',
    genre: 'HORROR',
    difficulty: 4,
    playerMin: 2,
    playerMax: 5,
    duration: 60,
    bookingUrl: 'https://example.com/book/theme-1',
    posterUrl: 'https://example.com/theme-1.jpg',
    fearLevel: 5,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
