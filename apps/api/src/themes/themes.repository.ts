import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { QueryThemesDto } from './dto/query-themes.dto';

export interface ThemeEntity {
  id: string;
  storeId: string;
  name: string;
  description: string;
  genre: 'HORROR' | 'THRILLER' | 'SF' | 'FANTASY' | 'MYSTERY' | 'ROMANCE' | 'ADVENTURE' | 'OTHER';
  difficulty: number;
  playerMin: number;
  playerMax: number;
  duration: number;
  bookingUrl: string | null;
  posterUrl: string | null;
  fearLevel: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ThemesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(params: {
    filters: Pick<QueryThemesDto, 'storeId' | 'genre' | 'difficulty'>;
    cursor?: string;
    limit: number;
  }): Promise<ThemeEntity[]> {
    const queryParams: unknown[] = [];
    const whereClauses: string[] = [];

    if (params.filters.storeId) {
      const storeIdIndex = queryParams.push(params.filters.storeId);
      whereClauses.push(`t.store_id = $${storeIdIndex}`);
    }

    if (params.filters.genre) {
      const genreIndex = queryParams.push(params.filters.genre);
      whereClauses.push(`t.genre = $${genreIndex}`);
    }

    if (params.filters.difficulty !== undefined) {
      const difficultyIndex = queryParams.push(params.filters.difficulty);
      whereClauses.push(`t.difficulty = $${difficultyIndex}`);
    }

    if (params.cursor) {
      const cursorIndex = queryParams.push(params.cursor);
      whereClauses.push(
        `(t.created_at, t.id) < (
          SELECT tc.created_at, tc.id
          FROM themes tc
          WHERE tc.id = $${cursorIndex}
        )`,
      );
    }

    const limitIndex = queryParams.push(params.limit);
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const { rows } = await this.databaseService.query<ThemeEntity>(
      `SELECT
         t.id,
         t.store_id AS "storeId",
         t.name,
         t.description,
         t.genre,
         t.difficulty,
         t.player_min AS "playerMin",
         t.player_max AS "playerMax",
         t.duration,
         t.booking_url AS "bookingUrl",
         t.poster_url AS "posterUrl",
         t.fear_level AS "fearLevel",
         t.created_at AS "createdAt",
         t.updated_at AS "updatedAt"
       FROM themes t
       ${whereSql}
       ORDER BY t.created_at DESC, t.id DESC
       LIMIT $${limitIndex}`,
      queryParams,
    );

    return rows;
  }

  async findById(id: string): Promise<ThemeEntity | null> {
    const { rows } = await this.databaseService.query<ThemeEntity>(
      `SELECT
         t.id,
         t.store_id AS "storeId",
         t.name,
         t.description,
         t.genre,
         t.difficulty,
         t.player_min AS "playerMin",
         t.player_max AS "playerMax",
         t.duration,
         t.booking_url AS "bookingUrl",
         t.poster_url AS "posterUrl",
         t.fear_level AS "fearLevel",
         t.created_at AS "createdAt",
         t.updated_at AS "updatedAt"
       FROM themes t
       WHERE t.id = $1
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
