import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface RegionEntity {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class RegionsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(params: {
    limit: number;
    cursor?: string;
  }): Promise<RegionEntity[]> {
    const { rows } = await this.databaseService.query<RegionEntity>(
      `SELECT r.id, r.name, r.city, r.latitude, r.longitude
       FROM regions r
       WHERE ($1::text IS NULL OR r.id < $1)
       ORDER BY r.id DESC
       LIMIT $2`,
      [params.cursor ?? null, params.limit],
    );

    return rows;
  }

  async findById(id: string): Promise<RegionEntity | null> {
    const { rows } = await this.databaseService.query<RegionEntity>(
      `SELECT r.id, r.name, r.city, r.latitude, r.longitude
       FROM regions r
       WHERE r.id = $1
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
