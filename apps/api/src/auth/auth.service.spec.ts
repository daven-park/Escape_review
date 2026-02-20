import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { createMockUser } from '../__mocks__/user.factory';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createLocalUser: jest.fn(),
      upsertGoogleUser: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    const jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const configServiceMock = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'jwt.secret') {
          return 'access-secret';
        }

        if (key === 'jwt.refreshSecret') {
          return 'refresh-secret';
        }

        throw new Error(`Unknown key: ${key}`);
      }),
      get: jest.fn((key: string) => {
        if (key === 'jwt.accessExpiresIn') {
          return '1h';
        }

        if (key === 'jwt.refreshExpiresIn') {
          return '30d';
        }

        if (key === 'auth.bcryptSaltRounds') {
          return 10;
        }

        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepositoryMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), setex: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateLocalUser', () => {
    it('should validate user with normalized email', async () => {
      const user = createMockUser({ passwordHash: 'hashed-password' });
      authRepository.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateLocalUser('  TEST@Example.com  ', 'password123');

      expect(result).toEqual(user);
      expect(authRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(service.validateLocalUser('test@example.com', 'password123')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const user = createMockUser({ passwordHash: 'hashed-password' });
      authRepository.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.validateLocalUser('test@example.com', 'wrong-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should issue tokens and store refresh token hash', async () => {
      const user = createMockUser({ refreshTokenHash: null });
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('refresh-hash' as never);

      const result = await service.login(user);

      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(result.user.email).toBe(user.email);
      expect(authRepository.updateRefreshTokenHash).toHaveBeenCalledWith(user.id, 'refresh-hash');
    });
  });

  describe('register', () => {
    it('should throw ConflictException when email is already used', async () => {
      authRepository.findByEmail.mockResolvedValue(createMockUser());

      await expect(
        service.register({
          email: 'test@example.com',
          name: '테스터',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should create local user and return tokens', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      const createdUser = createMockUser({
        id: 'user-2',
        email: 'new@example.com',
        name: '신규 유저',
      });

      authRepository.createLocalUser.mockResolvedValue(createdUser);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('password-hash' as never)
        .mockResolvedValueOnce('refresh-hash' as never);

      const result = await service.register({
        email: '  New@Example.com ',
        name: ' 신규 유저 ',
        password: 'password123',
      });

      expect(hashSpy).toHaveBeenCalledTimes(2);
      expect(authRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(authRepository.createLocalUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: '신규 유저',
        passwordHash: 'password-hash',
      });
      expect(result.tokens.accessToken).toBe('access-token');
    });
  });

  describe('refresh', () => {
    it('should issue new tokens when refresh token is valid', async () => {
      const user = createMockUser({ refreshTokenHash: 'stored-refresh-hash' });

      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      });
      authRepository.findById.mockResolvedValue(user);

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(true as never);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-refresh-hash' as never);

      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh('valid-refresh-token');

      expect(compareSpy).toHaveBeenCalledWith('valid-refresh-token', 'stored-refresh-hash');
      expect(hashSpy).toHaveBeenCalledWith('new-refresh-token', 10);
      expect(authRepository.updateRefreshTokenHash).toHaveBeenCalledWith(user.id, 'new-refresh-hash');
      expect(result.tokens.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException when refresh token verification fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh('invalid-refresh-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash', async () => {
      authRepository.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.logout('user-1');

      expect(authRepository.updateRefreshTokenHash).toHaveBeenCalledWith('user-1', null);
      expect(result).toEqual({ success: true });
    });
  });
});
