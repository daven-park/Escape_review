import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { LikesRepository } from './likes.repository';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly redisService: RedisService,
  ) {}

  async toggle(reviewId: string, userId: string) {
    const normalizedReviewId = this.normalizeRequiredId(reviewId, 'Review id');
    const reviewContext = await this.likesRepository.findActiveReviewContext(normalizedReviewId);

    if (!reviewContext) {
      throw new NotFoundException('Review not found');
    }

    const inserted = await this.likesRepository.insertLike(userId, normalizedReviewId);
    let liked = inserted;

    if (!inserted) {
      await this.likesRepository.deleteLike(userId, normalizedReviewId);
      liked = false;
    }

    const likeCount = await this.likesRepository.countByReviewId(normalizedReviewId);
    await this.invalidateThemeReviewsCache(reviewContext.themeId);

    return {
      reviewId: normalizedReviewId,
      liked,
      likeCount,
    };
  }

  private async invalidateThemeReviewsCache(themeId: string): Promise<void> {
    const redisClient = this.redisService.getClient();
    const pattern = `theme:${themeId}:reviews:*`;
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

  private normalizeRequiredId(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return normalized;
  }
}
