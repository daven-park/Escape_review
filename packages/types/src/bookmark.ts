import type { Genre } from './theme';

export interface Bookmark {
  id: string;
  userId: string;
  themeId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  reviewId: string;
}

export interface CreateBookmarkPayload {
  themeId: string;
}

export interface ToggleBookmarkResponse {
  themeId: string;
  bookmarked: boolean;
}

export interface BookmarkedTheme {
  id: string;
  themeId: string;
  createdAt: string;
  theme: {
    id: string;
    name: string;
    genre: Genre;
    difficulty: number;
    posterUrl: string | null;
    store: {
      id: string;
      name: string;
    };
  };
}
