export type Genre =
  | 'HORROR'
  | 'THRILLER'
  | 'SF'
  | 'FANTASY'
  | 'MYSTERY'
  | 'ROMANCE'
  | 'ADVENTURE'
  | 'OTHER';

export type DifficultyLabel = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

export interface Theme {
  id: string;
  storeId: string;
  name: string;
  description: string;
  genre: Genre;
  difficulty: number;
  playerMin: number;
  playerMax: number;
  duration: number;
  bookingUrl?: string;
  posterUrl?: string;
  fearLevel: number;
  createdAt: string;
}
