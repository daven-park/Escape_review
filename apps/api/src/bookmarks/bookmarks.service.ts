import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { BookmarksRepository } from './bookmarks.repository';

const MAX_LIMIT = 50;

@Injectable()
export class BookmarksService {
  constructor(private readonly bookmarksRepository: BookmarksRepository) {}

  async toggle(userId: string, dto: CreateBookmarkDto) {
    const themeId = this.normalizeRequiredId(dto.themeId, 'Theme id');
    const themeExists = await this.bookmarksRepository.themeExists(themeId);

    if (!themeExists) {
      throw new NotFoundException('Theme not found');
    }

    const inserted = await this.bookmarksRepository.insertBookmark(userId, themeId);
    let bookmarked = inserted;

    if (!inserted) {
      await this.bookmarksRepository.deleteBookmark(userId, themeId);
      bookmarked = false;
    }

    return {
      themeId,
      bookmarked,
    };
  }

  async findMyBookmarks(userId: string, limit: number, cursor?: string) {
    const normalizedLimit = this.normalizeLimit(limit);
    const normalizedCursor = this.normalizeOptionalId(cursor);

    const rows = await this.bookmarksRepository.findByUser({
      userId,
      cursor: normalizedCursor,
      limit: normalizedLimit + 1,
    });

    const bookmarks = rows.slice(0, normalizedLimit);
    const nextCursor =
      rows.length > normalizedLimit && bookmarks.length > 0
        ? bookmarks[bookmarks.length - 1].id
        : undefined;

    return {
      data: bookmarks,
      meta: {
        cursor: nextCursor,
      },
      error: null,
    };
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
