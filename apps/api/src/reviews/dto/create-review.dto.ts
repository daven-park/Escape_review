import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const REVIEW_DIFFICULTY_VALUES = ['EASY', 'NORMAL', 'HARD', 'VERY_HARD'] as const;
const REVIEW_RATING_VALUES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  themeId!: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }

    return value;
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  @IsIn(REVIEW_RATING_VALUES)
  rating!: number;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl(
    {
      require_protocol: true,
    },
    { each: true },
  )
  @Transform(({ value }: { value: unknown }) => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  })
  images?: string[];

  @IsIn(REVIEW_DIFFICULTY_VALUES)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  difficulty!: (typeof REVIEW_DIFFICULTY_VALUES)[number];

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  playedAt!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        return true;
      }

      if (value.toLowerCase() === 'false') {
        return false;
      }
    }

    return value;
  })
  @IsBoolean()
  spoilerWarning?: boolean;
}
