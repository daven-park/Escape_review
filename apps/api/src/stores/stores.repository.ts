import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export interface StoreEntity {
  id: string;
  name: string;
  regionId: string;
  address: string;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class StoresRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(params: {
    regionId?: string;
    cursor?: string;
    limit: number;
  }): Promise<StoreEntity[]> {
    const queryParams: unknown[] = [];
    const whereClauses: string[] = [];

    if (params.regionId) {
      const regionIdIndex = queryParams.push(params.regionId);
      whereClauses.push(`s.region_id = $${regionIdIndex}`);
    }

    if (params.cursor) {
      const cursorIndex = queryParams.push(params.cursor);
      whereClauses.push(
        `(s.created_at, s.id) < (
          SELECT sc.created_at, sc.id
          FROM stores sc
          WHERE sc.id = $${cursorIndex}
        )`,
      );
    }

    const limitIndex = queryParams.push(params.limit);
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const { rows } = await this.databaseService.query<StoreEntity>(
      `SELECT
         s.id,
         s.name,
         s.region_id AS "regionId",
         s.address,
         s.phone,
         s.website,
         s.image_url AS "imageUrl",
         s.created_at AS "createdAt",
         s.updated_at AS "updatedAt"
       FROM stores s
       ${whereSql}
       ORDER BY s.created_at DESC, s.id DESC
       LIMIT $${limitIndex}`,
      queryParams,
    );

    return rows;
  }

  async findById(id: string): Promise<StoreEntity | null> {
    const { rows } = await this.databaseService.query<StoreEntity>(
      `SELECT
         s.id,
         s.name,
         s.region_id AS "regionId",
         s.address,
         s.phone,
         s.website,
         s.image_url AS "imageUrl",
         s.created_at AS "createdAt",
         s.updated_at AS "updatedAt"
       FROM stores s
       WHERE s.id = $1
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
