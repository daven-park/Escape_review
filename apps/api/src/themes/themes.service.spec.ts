import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { createMockTheme } from '../__mocks__/theme.factory';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { ThemesRepository } from './themes.repository';
import { ThemesService } from './themes.service';

describe('ThemesService', () => {
  let service: ThemesService;
  let themesRepository: jest.Mocked<ThemesRepository>;
  let redisService: {
    get: jest.Mock;
    setex: jest.Mock;
  };

  beforeEach(async () => {
    const themesRepositoryMock = {
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ThemesRepository>;

    redisService = {
      get: jest.fn(),
      setex: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        { provide: ThemesRepository, useValue: themesRepositoryMock },
        { provide: RedisService, useValue: redisService },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
    themesRepository = module.get(ThemesRepository);
  });

  describe('findAll', () => {
    it('should return paginated theme list', async () => {
      const rows = [
        createMockTheme({ id: 'theme-1' }),
        createMockTheme({ id: 'theme-2' }),
        createMockTheme({ id: 'theme-3' }),
      ];
      themesRepository.findAll.mockResolvedValue(rows);

      const result = await service.findAll({
        limit: 2,
        storeId: ' store-1 ',
        genre: 'HORROR',
        cursor: ' cursor-1 ',
      });

      expect(themesRepository.findAll).toHaveBeenCalledWith({
        filters: {
          storeId: 'store-1',
          genre: 'HORROR',
          difficulty: undefined,
        },
        cursor: 'cursor-1',
        limit: 3,
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.cursor).toBe('theme-2');
      expect(result.error).toBeNull();
    });
  });

  describe('findOne (findById)', () => {
    it('should return cached theme detail when cache exists', async () => {
      const cachedTheme = createMockTheme({ id: 'theme-cached' });
      redisService.get.mockResolvedValue(JSON.stringify(cachedTheme));

      const result = await service.findById('theme-cached');

      expect(result).toEqual(cachedTheme);
      expect(themesRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch and cache theme detail when cache misses', async () => {
      const theme = createMockTheme({ id: 'theme-1' });
      redisService.get.mockResolvedValue(null);
      themesRepository.findById.mockResolvedValue(theme);

      const result = await service.findById(' theme-1 ');

      expect(themesRepository.findById).toHaveBeenCalledWith('theme-1');
      expect(redisService.setex).toHaveBeenCalledWith(
        'theme:theme-1:detail',
        900,
        JSON.stringify(theme),
      );
      expect(result).toEqual(theme);
    });

    it('should throw BadRequestException when theme id is empty', async () => {
      await expect(service.findById('   ')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw NotFoundException when theme does not exist', async () => {
      redisService.get.mockResolvedValue(null);
      themesRepository.findById.mockResolvedValue(null);

      await expect(service.findById('theme-404')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
