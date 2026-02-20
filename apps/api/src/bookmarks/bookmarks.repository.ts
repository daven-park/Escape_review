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

interface BookmarkListRow {
  id: string;
  themeId: string;
  createdAt: Date | string;
  themeName: string;
  themeGenre: Genre;
  themeDifficulty: number;
  themePosterUrl: string | null;
  storeId: string;
  storeName: string;
}

export interface BookmarkListEntity {
  id: string;
  themeId: string;
  createdAt: string;
  theme: {
    id: string;
    name: string;
    genre: Genre;
    difficulty: number;
    posterUrl: string | null;
    store: {
      id: string;
      name: string;
    };
  };
}

@Injectable()
export class BookmarksRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async themeExists(themeId: string): Promise<boolean> {
    const { rows } = await this.databaseService.query<{ id: string }>(
      `SELECT t.id
       FROM themes t
       WHERE t.id = $1
       LIMIT 1`,
      [themeId],
    );

    return rows.length > 0;
  }

  async insertBookmark(userId: string, themeId: string): Promise<boolean> {
    const result = await this.databaseService.query(
      `INSERT INTO bookmarks (id, user_id, theme_id)
       VALUES (gen_random_uuid()::text, $1, $2)
       ON CONFLICT (user_id, theme_id) DO NOTHING`,
      [userId, themeId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async deleteBookmark(userId: string, themeId: string): Promise<boolean> {
    const result = await this.databaseService.query(
      `DELETE FROM bookmarks
       WHERE user_id = $1
         AND theme_id = $2`,
      [userId, themeId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async findByUser(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }): Promise<BookmarkListEntity[]> {
    const queryParams: unknown[] = [params.userId];
    const whereClauses = ['b.user_id = $1'];

    if (params.cursor) {
      const cursorIndex = queryParams.push(params.cursor);
      whereClauses.push(
        `(b.created_at, b.id) < (
          SELECT bc.created_at, bc.id
          FROM bookmarks bc
          WHERE bc.id = $${cursorIndex}
            AND bc.user_id = $1
        )`,
      );
    }

    const limitIndex = queryParams.push(params.limit);

    const { rows } = await this.databaseService.query<BookmarkListRow>(
      `SELECT
         b.id,
         b.theme_id AS "themeId",
         b.created_at AS "createdAt",
         t.name AS "themeName",
         t.genre AS "themeGenre",
         t.difficulty AS "themeDifficulty",
         t.poster_url AS "themePosterUrl",
         s.id AS "storeId",
         s.name AS "storeName"
       FROM bookmarks b
       JOIN themes t ON t.id = b.theme_id
       JOIN stores s ON s.id = t.store_id
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY b.created_at DESC, b.id DESC
       LIMIT $${limitIndex}`,
      queryParams,
    );

    return rows.map((row) => this.mapListRow(row));
  }

  private mapListRow(row: BookmarkListRow): BookmarkListEntity {
    return {
      id: row.id,
      themeId: row.themeId,
      createdAt: this.toIsoString(row.createdAt),
      theme: {
        id: row.themeId,
        name: row.themeName,
        genre: row.themeGenre,
        difficulty: row.themeDifficulty,
        posterUrl: row.themePosterUrl,
        store: {
          id: row.storeId,
          name: row.storeName,
        },
      },
    };
  }

  private toIsoString(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}
