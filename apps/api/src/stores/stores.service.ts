import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { QueryStoresDto } from './dto/query-stores.dto';
import { StoreEntity, StoresRepository } from './stores.repository';

const DEFAULT_LIMIT = 20;
const STORE_DETAIL_CACHE_TTL_SECONDS = 900;

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly redisService: RedisService,
  ) {}

  async findAll(query: QueryStoresDto) {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = await this.storesRepository.findAll({
      regionId: this.normalizeOptionalString(query.regionId),
      cursor: this.normalizeOptionalString(query.cursor),
      limit: limit + 1,
    });

    const stores = rows.slice(0, limit);
    const nextCursor =
      rows.length > limit && stores.length > 0 ? stores[stores.length - 1].id : undefined;

    return {
      data: stores,
      meta: {
        cursor: nextCursor,
      },
      error: null,
    };
  }

  async findById(id: string): Promise<StoreEntity> {
    const normalizedId = id.trim();

    if (!normalizedId) {
      throw new BadRequestException('Store id is required');
    }

    const cacheKey = `store:${normalizedId}:detail`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as StoreEntity;
    }

    const store = await this.storesRepository.findById(normalizedId);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.redisService.setex(cacheKey, STORE_DETAIL_CACHE_TTL_SECONDS, JSON.stringify(store));
    return store;
  }

  private normalizeOptionalString(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
