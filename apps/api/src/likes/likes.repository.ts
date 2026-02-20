import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

interface ReviewContextRow {
  id: string;
  themeId: string;
}

@Injectable()
export class LikesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findActiveReviewContext(reviewId: string): Promise<{ id: string; themeId: string } | null> {
    const { rows } = await this.databaseService.query<ReviewContextRow>(
      `SELECT r.id, r.theme_id AS "themeId"
       FROM reviews r
       WHERE r.id = $1
         AND r.deleted_at IS NULL
       LIMIT 1`,
      [reviewId],
    );

    const row = rows[0];
    return row ? { id: row.id, themeId: row.themeId } : null;
  }

  async insertLike(userId: string, reviewId: string): Promise<boolean> {
    const result = await this.databaseService.query(
      `INSERT INTO likes (id, user_id, review_id)
       VALUES (gen_random_uuid()::text, $1, $2)
       ON CONFLICT (user_id, review_id) DO NOTHING`,
      [userId, reviewId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async deleteLike(userId: string, reviewId: string): Promise<boolean> {
    const result = await this.databaseService.query(
      `DELETE FROM likes
       WHERE user_id = $1
         AND review_id = $2`,
      [userId, reviewId],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async countByReviewId(reviewId: string): Promise<number> {
    const { rows } = await this.databaseService.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM likes
       WHERE review_id = $1`,
      [reviewId],
    );

    return rows[0]?.count ?? 0;
  }
}
