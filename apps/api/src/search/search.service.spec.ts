import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { SearchRepository } from './search.repository';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let searchRepository: jest.Mocked<SearchRepository>;

  beforeEach(async () => {
    const searchRepositoryMock = {
      searchThemes: jest.fn(),
      searchStores: jest.fn(),
    } as unknown as jest.Mocked<SearchRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: SearchRepository, useValue: searchRepositoryMock },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), setex: jest.fn() } },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    searchRepository = module.get(SearchRepository);
  });

  it('should search themes and stores for type=all', async () => {
    searchRepository.searchThemes.mockResolvedValue([
      {
        id: 'theme-1',
        name: '폐병원',
        description: '공포 테마',
        genre: 'HORROR',
        difficulty: 4,
        posterUrl: 'https://example.com/theme-1.jpg',
        storeId: 'store-1',
        storeName: '스토어1',
        rank: 0.9,
      },
    ]);

    searchRepository.searchStores.mockResolvedValue([
      {
        id: 'store-1',
        name: '스토어1',
        address: '서울시 강남구',
        imageUrl: 'https://example.com/store-1.jpg',
        regionId: 'region-1',
        regionName: '서울',
        rank: 0.8,
      },
    ]);

    const result = await service.search('  폐병원  ', 'all');

    expect(searchRepository.searchThemes).toHaveBeenCalledWith('폐병원', 20);
    expect(searchRepository.searchStores).toHaveBeenCalledWith('폐병원', 20);
    expect(result.meta).toEqual({ q: '폐병원', type: 'all' });
    expect(result.data.themes).toHaveLength(1);
    expect(result.data.stores).toHaveLength(1);
  });

  it('should search only themes for type=theme', async () => {
    searchRepository.searchThemes.mockResolvedValue([]);

    const result = await service.search('미스터리', 'theme');

    expect(searchRepository.searchThemes).toHaveBeenCalledWith('미스터리', 20);
    expect(searchRepository.searchStores).not.toHaveBeenCalled();
    expect(result.meta.type).toBe('theme');
  });

  it('should search only stores for type=store', async () => {
    searchRepository.searchStores.mockResolvedValue([]);

    const result = await service.search('강남', 'store');

    expect(searchRepository.searchThemes).not.toHaveBeenCalled();
    expect(searchRepository.searchStores).toHaveBeenCalledWith('강남', 20);
    expect(result.meta.type).toBe('store');
  });

  it('should throw BadRequestException for empty query', async () => {
    await expect(service.search('   ', 'all')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException for invalid type', async () => {
    await expect(service.search('query', 'invalid' as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
