import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { RegionEntity, RegionsRepository } from './regions.repository';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const REGION_LIST_CACHE_KEY = 'region:list';
const REGION_LIST_CACHE_TTL_SECONDS = 900;

@Injectable()
export class RegionsService {
  constructor(
    private readonly regionsRepository: RegionsRepository,
    private readonly redisService: RedisService,
  ) {}

  async findAll(limit: number, cursor?: string) {
    const normalizedLimit = this.normalizeLimit(limit);
    const normalizedCursor = this.normalizeCursor(cursor);
    const shouldUseCache = !normalizedCursor && normalizedLimit === DEFAULT_LIMIT;

    if (shouldUseCache) {
      const cached = await this.redisService.get(REGION_LIST_CACHE_KEY);

      if (cached) {
        return JSON.parse(cached) as {
          data: RegionEntity[];
          meta: { cursor?: string };
          error: null;
        };
      }
    }

    const rows = await this.regionsRepository.findAll({
      limit: normalizedLimit + 1,
      cursor: normalizedCursor,
    });

    const regions = rows.slice(0, normalizedLimit);
    const nextCursor =
      rows.length > normalizedLimit && regions.length > 0
        ? regions[regions.length - 1].id
        : undefined;

    const response = {
      data: regions,
      meta: {
        cursor: nextCursor,
      },
      error: null,
    };

    if (shouldUseCache) {
      await this.redisService.setex(
        REGION_LIST_CACHE_KEY,
        REGION_LIST_CACHE_TTL_SECONDS,
        JSON.stringify(response),
      );
    }

    return response;
  }

  async findById(id: string): Promise<RegionEntity> {
    const normalizedId = id.trim();

    if (!normalizedId) {
      throw new BadRequestException('Region id is required');
    }

    const region = await this.regionsRepository.findById(normalizedId);

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region;
  }

  private normalizeCursor(cursor?: string): string | undefined {
    const trimmed = cursor?.trim();
    return trimmed ? trimmed : undefined;
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      throw new BadRequestException(`limit must be an integer between 1 and ${MAX_LIMIT}`);
    }

    return limit;
  }
}
