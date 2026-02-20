import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

type Genre =
  | 'HORROR'
  | 'THRILLER'
  | 'SF'
  | 'FANTASY'
  | 'MYSTERY'
  | 'ROMANCE'
  | 'ADVENTURE'
  | 'OTHER';

export interface SearchThemeEntity {
  id: string;
  name: string;
  description: string;
  genre: Genre;
  difficulty: number;
  posterUrl: string | null;
  storeId: string;
  storeName: string;
  rank: number;
}

export interface SearchStoreEntity {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
  regionId: string;
  regionName: string;
  rank: number;
}

@Injectable()
export class SearchRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async searchThemes(query: string, limit: number): Promise<SearchThemeEntity[]> {
    const { rows } = await this.databaseService.query<SearchThemeEntity>(
      `SELECT
         t.id,
         t.name,
         t.description,
         t.genre,
         t.difficulty,
         t.poster_url AS "posterUrl",
         s.id AS "storeId",
         s.name AS "storeName",
         ts_rank(t.search_vector, plainto_tsquery('simple', $1))::float8 AS rank
       FROM themes t
       JOIN stores s ON s.id = t.store_id
       WHERE t.search_vector @@ plainto_tsquery('simple', $1)
       ORDER BY rank DESC, t.created_at DESC
       LIMIT $2`,
      [query, limit],
    );

    return rows;
  }

  async searchStores(query: string, limit: number): Promise<SearchStoreEntity[]> {
    const { rows } = await this.databaseService.query<SearchStoreEntity>(
      `SELECT
         s.id,
         s.name,
         s.address,
         s.image_url AS "imageUrl",
         r.id AS "regionId",
         r.name AS "regionName",
         ts_rank(s.search_vector, plainto_tsquery('simple', $1))::float8 AS rank
       FROM stores s
       JOIN regions r ON r.id = s.region_id
       WHERE s.search_vector @@ plainto_tsquery('simple', $1)
       ORDER BY rank DESC, s.created_at DESC
       LIMIT $2`,
      [query, limit],
    );

    return rows;
  }
}
