import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { BookmarksRepository } from './bookmarks.repository';
import { BookmarksService } from './bookmarks.service';

describe('BookmarksService', () => {
  let service: BookmarksService;
  let bookmarksRepository: jest.Mocked<BookmarksRepository>;

  beforeEach(async () => {
    const bookmarksRepositoryMock = {
      themeExists: jest.fn(),
      insertBookmark: jest.fn(),
      deleteBookmark: jest.fn(),
      findByUser: jest.fn(),
    } as unknown as jest.Mocked<BookmarksRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        { provide: BookmarksRepository, useValue: bookmarksRepositoryMock },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
        { provide: RedisService, useValue: { get: jest.fn(), setex: jest.fn() } },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    bookmarksRepository = module.get(BookmarksRepository);
  });

  describe('toggle', () => {
    it('should create bookmark when not bookmarked yet', async () => {
      bookmarksRepository.themeExists.mockResolvedValue(true);
      bookmarksRepository.insertBookmark.mockResolvedValue(true);

      const result = await service.toggle('user-1', { themeId: ' theme-1 ' });

      expect(bookmarksRepository.insertBookmark).toHaveBeenCalledWith('user-1', 'theme-1');
      expect(bookmarksRepository.deleteBookmark).not.toHaveBeenCalled();
      expect(result).toEqual({ themeId: 'theme-1', bookmarked: true });
    });

    it('should remove bookmark when already bookmarked', async () => {
      bookmarksRepository.themeExists.mockResolvedValue(true);
      bookmarksRepository.insertBookmark.mockResolvedValue(false);
      bookmarksRepository.deleteBookmark.mockResolvedValue(true);

      const result = await service.toggle('user-1', { themeId: 'theme-1' });

      expect(bookmarksRepository.deleteBookmark).toHaveBeenCalledWith('user-1', 'theme-1');
      expect(result).toEqual({ themeId: 'theme-1', bookmarked: false });
    });

    it('should throw NotFoundException when theme does not exist', async () => {
      bookmarksRepository.themeExists.mockResolvedValue(false);

      await expect(service.toggle('user-1', { themeId: 'theme-404' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findMyBookmarks', () => {
    it('should return paginated bookmarks', async () => {
      bookmarksRepository.findByUser.mockResolvedValue([
        {
          id: 'bookmark-1',
          themeId: 'theme-1',
          createdAt: '2024-03-15T00:00:00.000Z',
          theme: {
            id: 'theme-1',
            name: '테마1',
            genre: 'HORROR',
            difficulty: 4,
            posterUrl: 'https://example.com/theme-1.jpg',
            store: {
              id: 'store-1',
              name: '스토어1',
            },
          },
        },
        {
          id: 'bookmark-2',
          themeId: 'theme-2',
          createdAt: '2024-03-14T00:00:00.000Z',
          theme: {
            id: 'theme-2',
            name: '테마2',
            genre: 'MYSTERY',
            difficulty: 3,
            posterUrl: null,
            store: {
              id: 'store-1',
              name: '스토어1',
            },
          },
        },
      ]);

      const result = await service.findMyBookmarks('user-1', 1, ' bookmark-1 ');

      expect(bookmarksRepository.findByUser).toHaveBeenCalledWith({
        userId: 'user-1',
        cursor: 'bookmark-1',
        limit: 2,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.cursor).toBe('bookmark-1');
      expect(result.error).toBeNull();
    });

    it('should throw BadRequestException when limit is invalid', async () => {
      await expect(service.findMyBookmarks('user-1', 0)).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
