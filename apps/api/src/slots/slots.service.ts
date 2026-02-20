import { Injectable } from '@nestjs/common';

import { RedisService } from '../redis/redis.service';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { SlotEntity, SlotsRepository } from './slots.repository';

const SLOTS_CACHE_TTL_SECONDS = 30;

@Injectable()
export class SlotsService {
  constructor(
    private readonly slotsRepository: SlotsRepository,
    private readonly redisService: RedisService,
  ) {}

  async findByThemeAndDate(query: QuerySlotsDto): Promise<SlotEntity[]> {
    const themeId = query.themeId.trim();
    const date = query.date.trim();
    const cacheKey = `slots:${themeId}:${date}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as SlotEntity[];
    }

    const slots = await this.slotsRepository.findByThemeAndDate(themeId, date);
    await this.redisService.setex(cacheKey, SLOTS_CACHE_TTL_SECONDS, JSON.stringify(slots));
    return slots;
  }
}
