import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const GENRE_VALUES = [
  'HORROR',
  'THRILLER',
  'SF',
  'FANTASY',
  'MYSTERY',
  'ROMANCE',
  'ADVENTURE',
  'OTHER',
] as const;

export class QueryThemesDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  storeId?: string;

  @IsOptional()
  @IsIn(GENRE_VALUES)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  genre?: (typeof GENRE_VALUES)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  })
  difficulty?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined,
  )
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  })
  limit?: number;
}
