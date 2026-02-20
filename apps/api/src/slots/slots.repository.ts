import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface SlotEntity {
  id: string;
  themeId: string;
  date: string;
  time: string;
  isAvailable: boolean;
  price: number | null;
}

@Injectable()
export class SlotsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByThemeAndDate(themeId: string, date: string): Promise<SlotEntity[]> {
    const { rows } = await this.databaseService.query<SlotEntity>(
      `SELECT
         s.id,
         s.theme_id AS "themeId",
         s.date::text AS date,
         s.time,
         s.is_available AS "isAvailable",
         s.price
       FROM available_slots s
       WHERE s.theme_id = $1
         AND s.date = $2::date
       ORDER BY s.time ASC`,
      [themeId, date],
    );

    return rows;
  }
}
