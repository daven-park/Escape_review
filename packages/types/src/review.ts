import type { DifficultyLabel } from './theme';
import type { User } from './user';

export interface Review {
  id: string;
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: DifficultyLabel;
  playedAt: string;
  spoilerWarning: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  likeCount: number;
  isLiked?: boolean;
}

export interface CreateReviewPayload {
  themeId: string;
  rating: number;
  content: string;
  images?: string[];
  difficulty: DifficultyLabel;
  playedAt: string;
  spoilerWarning?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  content?: string;
  images?: string[];
  difficulty?: DifficultyLabel;
  playedAt?: string;
  spoilerWarning?: boolean;
}

export interface ToggleLikeResponse {
  reviewId: string;
  liked: boolean;
  likeCount: number;
}
