import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createMockReview } from '../__mocks__/review.factory';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: jest.Mocked<ReviewsRepository>;
  let redisService: {
    get: jest.Mock;
    setex: jest.Mock;
    getClient: jest.Mock;
  };

  beforeEach(async () => {
    const reviewsRepositoryMock = {
      findByTheme: jest.fn(),
      themeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdForMutation: jest.fn(),
      updateById: jest.fn(),
      softDeleteById: jest.fn(),
    } as unknown as jest.Mocked<ReviewsRepository>;

    redisService = {
      get: jest.fn(),
      setex: jest.fn(),
      getClient: jest.fn(() => ({
        scan: jest.fn().mockResolvedValue(['0', []]),
        del: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: reviewsRepositoryMock },
        { provide: RedisService, useValue: redisService },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewsRepository = module.get(ReviewsRepository);
  });

  describe('findByTheme', () => {
    it('should return cached theme reviews when cache exists', async () => {
      const cachedResponse = {
        data: [createMockReview()],
        meta: { cursor: 'cursor-1' },
        error: null,
      };
      redisService.get.mockResolvedValue(JSON.stringify(cachedResponse));

      const result = await service.findByTheme('theme-1', 10, 'cursor-1');

      expect(result).toEqual(cachedResponse);
      expect(reviewsRepository.findByTheme).not.toHaveBeenCalled();
    });

    it('should query repository and cache response when cache misses', async () => {
      const rows = [
        createMockReview({ id: 'review-1' }),
        createMockReview({ id: 'review-2' }),
        createMockReview({ id: 'review-3' }),
      ];

      redisService.get.mockResolvedValue(null);
      reviewsRepository.findByTheme.mockResolvedValue(rows);

      const result = await service.findByTheme(' theme-1 ', 2, ' cursor-1 ');

      expect(reviewsRepository.findByTheme).toHaveBeenCalledWith({
        themeId: 'theme-1',
        cursor: 'cursor-1',
        limit: 3,
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.cursor).toBe('review-2');
      expect(redisService.setex).toHaveBeenCalledWith(
        'theme:theme-1:reviews:limit:2:cursor:cursor-1',
        120,
        JSON.stringify(result),
      );
    });
  });

  describe('create', () => {
    it('should create review and invalidate cache', async () => {
      const created = createMockReview({ id: 'review-2', themeId: 'theme-1' });

      reviewsRepository.themeExists.mockResolvedValue(true);
      reviewsRepository.create.mockResolvedValue('review-2');
      reviewsRepository.findById.mockResolvedValue(created);

      const invalidateSpy = jest
        .spyOn(service, 'invalidateThemeReviewsCache')
        .mockResolvedValue(undefined);

      const result = await service.create('user-1', {
        themeId: ' theme-1 ',
        rating: 4.5,
        content: '정말 재미있었고 문제 구성이 매우 탄탄했습니다!',
        difficulty: 'HARD',
        playedAt: '2024-03-15',
      });

      expect(reviewsRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        themeId: 'theme-1',
        rating: 4.5,
        content: '정말 재미있었고 문제 구성이 매우 탄탄했습니다!',
        images: [],
        difficulty: 'HARD',
        playedAt: '2024-03-15',
        spoilerWarning: false,
      });
      expect(invalidateSpy).toHaveBeenCalledWith('theme-1');
      expect(result.id).toBe('review-2');
    });

    it('should throw NotFoundException when theme does not exist', async () => {
      reviewsRepository.themeExists.mockResolvedValue(false);

      await expect(
        service.create('user-1', {
          themeId: 'theme-unknown',
          rating: 4,
          content: '내용이 충분히 긴 테스트용 리뷰 본문입니다.',
          difficulty: 'NORMAL',
          playedAt: '2024-03-15',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update own review and invalidate cache', async () => {
      reviewsRepository.findByIdForMutation.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        themeId: 'theme-1',
        deletedAt: null,
      });
      reviewsRepository.updateById.mockResolvedValue(true);
      reviewsRepository.findById.mockResolvedValue(createMockReview({ content: '수정된 리뷰 내용입니다.' }));

      const invalidateSpy = jest
        .spyOn(service, 'invalidateThemeReviewsCache')
        .mockResolvedValue(undefined);

      const result = await service.update('review-1', 'user-1', {
        content: '수정된 리뷰 내용입니다.',
      });

      expect(reviewsRepository.updateById).toHaveBeenCalledWith('review-1', {
        rating: undefined,
        content: '수정된 리뷰 내용입니다.',
        images: undefined,
        difficulty: undefined,
        playedAt: undefined,
        spoilerWarning: undefined,
      });
      expect(invalidateSpy).toHaveBeenCalledWith('theme-1');
      expect(result.content).toBe('수정된 리뷰 내용입니다.');
    });

    it('should throw ForbiddenException when updating another user review', async () => {
      reviewsRepository.findByIdForMutation.mockResolvedValue({
        id: 'review-1',
        userId: 'user-2',
        themeId: 'theme-1',
        deletedAt: null,
      });

      await expect(service.update('review-1', 'user-1', { rating: 4 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when update payload is empty', async () => {
      reviewsRepository.findByIdForMutation.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        themeId: 'theme-1',
        deletedAt: null,
      });

      await expect(service.update('review-1', 'user-1', {})).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('delete (softDelete)', () => {
    it('should soft delete own review and invalidate cache', async () => {
      reviewsRepository.findByIdForMutation.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        themeId: 'theme-1',
        deletedAt: null,
      });
      reviewsRepository.softDeleteById.mockResolvedValue(true);

      const invalidateSpy = jest
        .spyOn(service, 'invalidateThemeReviewsCache')
        .mockResolvedValue(undefined);

      const result = await service.softDelete('review-1', 'user-1');

      expect(reviewsRepository.softDeleteById).toHaveBeenCalledWith('review-1');
      expect(invalidateSpy).toHaveBeenCalledWith('theme-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException when review is missing', async () => {
      reviewsRepository.findByIdForMutation.mockResolvedValue(null);

      await expect(service.softDelete('review-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
