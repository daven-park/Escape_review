import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { DatabaseService } from '../src/database/database.service';
import { RedisService } from '../src/redis/redis.service';
import { ReviewsController } from '../src/reviews/reviews.controller';
import { ReviewsService } from '../src/reviews/reviews.service';

describe('Reviews (e2e)', () => {
  let app: INestApplication;

  const reviewsServiceMock = {
    findByTheme: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const jwtAuthGuardMock = {
    canActivate: (context: ExecutionContext): boolean => {
      const req = context.switchToHttp().getRequest() as { user?: { id: string } };
      req.user = { id: 'user-1' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: reviewsServiceMock },
        { provide: JwtAuthGuard, useValue: jwtAuthGuardMock },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), setex: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/themes/:themeId/reviews - list reviews', async () => {
    reviewsServiceMock.findByTheme.mockResolvedValue({
      data: [
        {
          id: 'review-1',
          userId: 'user-1',
          themeId: 'theme-1',
          rating: 4.5,
          content: '정말 재미있었습니다! 문제 구성이 매우 좋았어요.',
          images: [],
          difficulty: 'HARD',
          playedAt: '2024-03-15',
          spoilerWarning: false,
          createdAt: '2024-03-15T00:00:00.000Z',
          updatedAt: '2024-03-15T00:00:00.000Z',
          user: {
            id: 'user-1',
            name: '테스터',
            avatar: null,
          },
          likeCount: 0,
        },
      ],
      meta: {
        cursor: undefined,
      },
      error: null,
    });

    const res = await request(app.getHttpServer()).get('/api/v1/themes/theme-1/reviews?limit=20');

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('review-1');
    expect(reviewsServiceMock.findByTheme).toHaveBeenCalledWith('theme-1', 20, undefined);
  });

  it('POST /api/v1/reviews - create review', async () => {
    reviewsServiceMock.create.mockResolvedValue({
      id: 'review-2',
      userId: 'user-1',
      themeId: 'theme-1',
      rating: 5,
      content: '몰입감이 뛰어나고 연출이 훌륭해서 다시 도전하고 싶습니다.',
      images: [],
      difficulty: 'VERY_HARD',
      playedAt: '2024-03-15',
      spoilerWarning: false,
      createdAt: '2024-03-15T00:00:00.000Z',
      updatedAt: '2024-03-15T00:00:00.000Z',
      user: {
        id: 'user-1',
        name: '테스터',
        avatar: null,
      },
      likeCount: 0,
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        themeId: 'theme-1',
        rating: 5,
        content: '몰입감이 뛰어나고 연출이 훌륭해서 다시 도전하고 싶습니다.',
        difficulty: 'VERY_HARD',
        playedAt: '2024-03-15',
        spoilerWarning: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('review-2');
    expect(reviewsServiceMock.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        themeId: 'theme-1',
        rating: 5,
      }),
    );
  });

  it('PATCH /api/v1/reviews/:id - update review', async () => {
    reviewsServiceMock.update.mockResolvedValue({
      id: 'review-2',
      userId: 'user-1',
      themeId: 'theme-1',
      rating: 4,
      content: '수정된 리뷰 내용입니다. 문제 난이도가 생각보다 높았습니다.',
      images: [],
      difficulty: 'HARD',
      playedAt: '2024-03-15',
      spoilerWarning: false,
      createdAt: '2024-03-15T00:00:00.000Z',
      updatedAt: '2024-03-16T00:00:00.000Z',
      user: {
        id: 'user-1',
        name: '테스터',
        avatar: null,
      },
      likeCount: 1,
    });

    const res = await request(app.getHttpServer())
      .patch('/api/v1/reviews/review-2')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        rating: 4,
        content: '수정된 리뷰 내용입니다. 문제 난이도가 생각보다 높았습니다.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(4);
    expect(reviewsServiceMock.update).toHaveBeenCalledWith(
      'review-2',
      'user-1',
      expect.objectContaining({ rating: 4 }),
    );
  });

  it('DELETE /api/v1/reviews/:id - delete review', async () => {
    reviewsServiceMock.softDelete.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .delete('/api/v1/reviews/review-2')
      .set('Authorization', 'Bearer mocked-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
    expect(reviewsServiceMock.softDelete).toHaveBeenCalledWith('review-2', 'user-1');
  });

  it('POST /api/v1/reviews - rejects short content', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        themeId: 'theme-1',
        rating: 3,
        content: '짧음',
        difficulty: 'NORMAL',
        playedAt: '2024-03-15',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(reviewsServiceMock.create).not.toHaveBeenCalled();
  });
});
