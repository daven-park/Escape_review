import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity, ReviewsRepository } from './reviews.repository';

const MAX_LIMIT = 50;
const REVIEWS_CACHE_TTL_SECONDS = 120;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly redisService: RedisService,
  ) {}

  async findByTheme(themeId: string, limit: number, cursor?: string) {
    const normalizedThemeId = this.normalizeRequiredId(themeId, 'Theme id');
    const normalizedLimit = this.normalizeLimit(limit);
    const normalizedCursor = this.normalizeOptionalId(cursor);
    const cacheKey = this.buildThemeReviewsCacheKey(
      normalizedThemeId,
      normalizedLimit,
      normalizedCursor,
    );

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as {
        data: ReviewEntity[];
        meta: { cursor?: string };
        error: null;
      };
    }

    const rows = await this.reviewsRepository.findByTheme({
      themeId: normalizedThemeId,
      cursor: normalizedCursor,
      limit: normalizedLimit + 1,
    });

    const reviews = rows.slice(0, normalizedLimit);
    const nextCursor =
      rows.length > normalizedLimit && reviews.length > 0
        ? reviews[reviews.length - 1].id
        : undefined;

    const response = {
      data: reviews,
      meta: {
        cursor: nextCursor,
      },
      error: null,
    };

    await this.redisService.setex(cacheKey, REVIEWS_CACHE_TTL_SECONDS, JSON.stringify(response));
    return response;
  }

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewEntity> {
    const themeId = this.normalizeRequiredId(dto.themeId, 'Theme id');
    const themeExists = await this.reviewsRepository.themeExists(themeId);

    if (!themeExists) {
      throw new NotFoundException('Theme not found');
    }

    const createdReviewId = await this.reviewsRepository.create({
      userId,
      themeId,
      rating: dto.rating,
      content: dto.content,
      images: dto.images ?? [],
      difficulty: dto.difficulty,
      playedAt: dto.playedAt,
      spoilerWarning: dto.spoilerWarning ?? false,
    });

    const createdReview = await this.reviewsRepository.findById(createdReviewId);

    if (!createdReview) {
      throw new NotFoundException('Review not found');
    }

    await this.invalidateThemeReviewsCache(themeId);
    return createdReview;
  }

  async update(id: string, userId: string, dto: UpdateReviewDto): Promise<ReviewEntity> {
    const reviewId = this.normalizeRequiredId(id, 'Review id');
    const targetReview = await this.reviewsRepository.findByIdForMutation(reviewId);

    if (!targetReview || targetReview.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    if (targetReview.userId !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    const hasChanges =
      dto.rating !== undefined ||
      dto.content !== undefined ||
      dto.images !== undefined ||
      dto.difficulty !== undefined ||
      dto.playedAt !== undefined ||
      dto.spoilerWarning !== undefined;

    if (!hasChanges) {
      throw new BadRequestException('At least one field is required to update a review');
    }

    await this.reviewsRepository.updateById(reviewId, {
      rating: dto.rating,
      content: dto.content,
      images: dto.images,
      difficulty: dto.difficulty,
      playedAt: dto.playedAt,
      spoilerWarning: dto.spoilerWarning,
    });

    const updatedReview = await this.reviewsRepository.findById(reviewId);

    if (!updatedReview) {
      throw new NotFoundException('Review not found');
    }

    await this.invalidateThemeReviewsCache(targetReview.themeId);
    return updatedReview;
  }

  async softDelete(id: string, userId: string): Promise<{ success: boolean }> {
    const reviewId = this.normalizeRequiredId(id, 'Review id');
    const targetReview = await this.reviewsRepository.findByIdForMutation(reviewId);

    if (!targetReview || targetReview.deletedAt) {
      throw new NotFoundException('Review not found');
    }

    if (targetReview.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    const deleted = await this.reviewsRepository.softDeleteById(reviewId);

    if (!deleted) {
      throw new NotFoundException('Review not found');
    }

    await this.invalidateThemeReviewsCache(targetReview.themeId);
    return { success: true };
  }

  async invalidateThemeReviewsCache(themeId: string): Promise<void> {
    const pattern = this.buildThemeReviewsCachePattern(themeId);
    const redisClient = this.redisService.getClient();
    let cursor = '0';

    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100',
      );

      if (keys.length > 0) {
        await redisClient.del(...keys);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }

  private buildThemeReviewsCacheKey(themeId: string, limit: number, cursor?: string): string {
    const cursorValue = cursor ?? 'first';
    return `theme:${themeId}:reviews:limit:${limit}:cursor:${cursorValue}`;
  }

  private buildThemeReviewsCachePattern(themeId: string): string {
    return `theme:${themeId}:reviews:*`;
  }

  private normalizeRequiredId(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return normalized;
  }

  private normalizeOptionalId(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : undefined;
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      throw new BadRequestException(`limit must be an integer between 1 and ${MAX_LIMIT}`);
    }

    return limit;
  }
}
