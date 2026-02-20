import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: (strategy: string) =>
    class MockPassportGuard {
      canActivate(context: {
        switchToHttp: () => {
          getRequest: () => Record<string, unknown>;
        };
      }): boolean {
        const req = context.switchToHttp().getRequest();

        if (strategy === 'local') {
          const body = (req.body ?? {}) as { email?: string };
          req.user = {
            id: 'user-1',
            email: body.email ?? 'test@example.com',
            name: '테스트 유저',
            avatar: null,
            provider: 'LOCAL',
            passwordHash: '$2b$10$mock',
            refreshTokenHash: null,
            createdAt: '2024-03-15T00:00:00.000Z',
            updatedAt: '2024-03-15T00:00:00.000Z',
          };
        }

        if (strategy === 'jwt') {
          req.user = {
            id: 'user-1',
            email: 'test@example.com',
            name: '테스트 유저',
            provider: 'LOCAL',
          };
        }

        return true;
      }
    },
}));

import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { DatabaseService } from '../src/database/database.service';
import { RedisService } from '../src/redis/redis.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        JwtAuthGuard,
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

  it('POST /api/v1/auth/register - register flow', async () => {
    authServiceMock.register.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '테스트 유저',
        avatar: null,
        provider: 'LOCAL',
        createdAt: '2024-03-15T00:00:00.000Z',
        updatedAt: '2024-03-15T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    const res = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      name: '테스트 유저',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.tokens.accessToken).toBe('access-token');
    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: '테스트 유저',
      password: 'password123',
    });
  });

  it('POST /api/v1/auth/login - login flow', async () => {
    authServiceMock.login.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '테스트 유저',
        avatar: null,
        provider: 'LOCAL',
        createdAt: '2024-03-15T00:00:00.000Z',
        updatedAt: '2024-03-15T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.refreshToken).toBe('refresh-token');
    expect(authServiceMock.login).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        email: 'test@example.com',
      }),
    );
  });

  it('POST /api/v1/auth/refresh - refresh flow', async () => {
    authServiceMock.refresh.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '테스트 유저',
        avatar: null,
        provider: 'LOCAL',
        createdAt: '2024-03-15T00:00:00.000Z',
        updatedAt: '2024-03-15T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    });

    const res = await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({
      refreshToken: 'refresh-token',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBe('new-access-token');
    expect(authServiceMock.refresh).toHaveBeenCalledWith('refresh-token');
  });

  it('POST /api/v1/auth/logout - logout flow', async () => {
    authServiceMock.logout.mockResolvedValue({ success: true });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer mocked-token');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
    expect(authServiceMock.logout).toHaveBeenCalledWith('user-1');
  });
});
