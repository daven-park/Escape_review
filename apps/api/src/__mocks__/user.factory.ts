import { AuthUserWithSecrets } from '../auth/auth.repository';

export function createMockUser(
  overrides: Partial<AuthUserWithSecrets> = {},
): AuthUserWithSecrets {
  const now = '2024-03-15T00:00:00.000Z';

  return {
    id: 'user-1',
    email: 'test@example.com',
    name: '테스트 유저',
    avatar: null,
    provider: 'LOCAL',
    passwordHash: '$2b$10$mockedPasswordHash',
    refreshTokenHash: '$2b$10$mockedRefreshTokenHash',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
