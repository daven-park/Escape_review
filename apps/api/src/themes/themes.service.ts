import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { QueryThemesDto } from './dto/query-themes.dto';
import { ThemeEntity, ThemesRepository } from './themes.repository';

const DEFAULT_LIMIT = 20;
const THEME_DETAIL_CACHE_TTL_SECONDS = 900;

@Injectable()
export class ThemesService {
  constructor(
    private readonly themesRepository: ThemesRepository,
    private readonly redisService: RedisService,
  ) {}

  async findAll(query: QueryThemesDto) {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = await this.themesRepository.findAll({
      filters: {
        storeId: this.normalizeOptionalString(query.storeId),
        genre: query.genre,
        difficulty: query.difficulty,
      },
      cursor: this.normalizeOptionalString(query.cursor),
      limit: limit + 1,
    });

    const themes = rows.slice(0, limit);
    const nextCursor =
      rows.length > limit && themes.length > 0 ? themes[themes.length - 1].id : undefined;

    return {
      data: themes,
      meta: {
        cursor: nextCursor,
      },
      error: null,
    };
  }

  async findById(id: string): Promise<ThemeEntity> {
    const normalizedId = id.trim();

    if (!normalizedId) {
      throw new BadRequestException('Theme id is required');
    }

    const cacheKey = `theme:${normalizedId}:detail`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ThemeEntity;
    }

    const theme = await this.themesRepository.findById(normalizedId);

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    await this.redisService.setex(cacheKey, THEME_DETAIL_CACHE_TTL_SECONDS, JSON.stringify(theme));
    return theme;
  }

  private normalizeOptionalString(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
