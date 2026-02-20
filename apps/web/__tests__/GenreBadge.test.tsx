import type { Genre } from '@escape/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GenreBadge } from '@/components/theme/GenreBadge';

describe('GenreBadge', () => {
  it.each([
    ['HORROR', '호러', 'bg-rose-50'],
    ['SF', 'SF', 'bg-cyan-50'],
    ['MYSTERY', '미스터리', 'bg-blue-50'],
    ['ROMANCE', '로맨스', 'bg-pink-50'],
  ] as const)(
    'renders %s badge label and class',
    (genre, expectedLabel, expectedClass) => {
      render(<GenreBadge genre={genre as Genre} />);

      const badge = screen.getByText(expectedLabel);
      expect(badge).toBeTruthy();
      expect(badge.className.includes(expectedClass)).toBe(true);
    },
  );
});
