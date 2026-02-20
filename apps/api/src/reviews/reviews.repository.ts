import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

type ReviewDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

interface ReviewRow {
  id: string;
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: ReviewDifficulty;
  playedAt: string;
  spoilerWarning: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  likeCount: number;
}

interface ReviewMutationTargetRow {
  id: string;
  userId: string;
  themeId: string;
  deletedAt: Date | string | null;
}

export interface ReviewEntity {
  id: string;
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: ReviewDifficulty;
  playedAt: string;
  spoilerWarning: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  likeCount: number;
}

export interface ReviewMutationTarget {
  id: string;
  userId: string;
  themeId: string;
  deletedAt: string | null;
}

interface CreateReviewParams {
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: ReviewDifficulty;
  playedAt: string;
  spoilerWarning: boolean;
}

interface UpdateReviewParams {
  rating?: number;
  content?: string;
  images?: string[];
  difficulty?: ReviewDifficulty;
  playedAt?: string;
  spoilerWarning?: boolean;
}

@Injectable()
export class ReviewsRepository {
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

  async findByTheme(params: {
    themeId: string;
    cursor?: string;
    limit: number;
  }): Promise<ReviewEntity[]> {
    const queryParams: unknown[] = [params.themeId];
    const whereClauses: string[] = ['r.theme_id = $1', 'r.deleted_at IS NULL'];

    if (params.cursor) {
      const cursorIndex = queryParams.push(params.cursor);
      whereClauses.push(
        `(r.created_at, r.id) < (
          SELECT rc.created_at, rc.id
          FROM reviews rc
          WHERE rc.id = $${cursorIndex}
            AND rc.theme_id = $1
            AND rc.deleted_at IS NULL
        )`,
      );
    }

    const limitIndex = queryParams.push(params.limit);

    const { rows } = await this.databaseService.query<ReviewRow>(
      `SELECT
         r.id,
         r.user_id AS "userId",
         r.theme_id AS "themeId",
         r.rating::float8 AS rating,
         r.content,
         r.images,
         r.difficulty,
         r.played_at::text AS "playedAt",
         r.spoiler_warning AS "spoilerWarning",
         r.created_at AS "createdAt",
         r.updated_at AS "updatedAt",
         u.id AS "authorId",
         u.name AS "authorName",
         u.avatar AS "authorAvatar",
         COUNT(l.id)::int AS "likeCount"
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN likes l ON l.review_id = r.id
       WHERE ${whereClauses.join(' AND ')}
       GROUP BY
         r.id,
         r.user_id,
         r.theme_id,
         r.rating,
         r.content,
         r.images,
         r.difficulty,
         r.played_at,
         r.spoiler_warning,
         r.created_at,
         r.updated_at,
         u.id,
         u.name,
         u.avatar
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT $${limitIndex}`,
      queryParams,
    );

    return rows.map((row) => this.mapReviewRow(row));
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const { rows } = await this.databaseService.query<ReviewRow>(
      `SELECT
         r.id,
         r.user_id AS "userId",
         r.theme_id AS "themeId",
         r.rating::float8 AS rating,
         r.content,
         r.images,
         r.difficulty,
         r.played_at::text AS "playedAt",
         r.spoiler_warning AS "spoilerWarning",
         r.created_at AS "createdAt",
         r.updated_at AS "updatedAt",
         u.id AS "authorId",
         u.name AS "authorName",
         u.avatar AS "authorAvatar",
         COUNT(l.id)::int AS "likeCount"
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN likes l ON l.review_id = r.id
       WHERE r.id = $1
         AND r.deleted_at IS NULL
       GROUP BY
         r.id,
         r.user_id,
         r.theme_id,
         r.rating,
         r.content,
         r.images,
         r.difficulty,
         r.played_at,
         r.spoiler_warning,
         r.created_at,
         r.updated_at,
         u.id,
         u.name,
         u.avatar
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.mapReviewRow(row) : null;
  }

  async findByIdForMutation(id: string): Promise<ReviewMutationTarget | null> {
    const { rows } = await this.databaseService.query<ReviewMutationTargetRow>(
      `SELECT
         r.id,
         r.user_id AS "userId",
         r.theme_id AS "themeId",
         r.deleted_at AS "deletedAt"
       FROM reviews r
       WHERE r.id = $1
       LIMIT 1`,
      [id],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.userId,
      themeId: row.themeId,
      deletedAt: row.deletedAt ? this.toIsoString(row.deletedAt) : null,
    };
  }

  async create(params: CreateReviewParams): Promise<string> {
    const { rows } = await this.databaseService.query<{ id: string }>(
      `INSERT INTO reviews
         (
           id,
           user_id,
           theme_id,
           rating,
           content,
           images,
           difficulty,
           played_at,
           spoiler_warning
         )
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        params.userId,
        params.themeId,
        params.rating,
        params.content,
        params.images,
        params.difficulty,
        params.playedAt,
        params.spoilerWarning,
      ],
    );

    return rows[0].id;
  }

  async updateById(id: string, params: UpdateReviewParams): Promise<boolean> {
    const queryParams: unknown[] = [];
    const setClauses: string[] = [];

    if (params.rating !== undefined) {
      const ratingIndex = queryParams.push(params.rating);
      setClauses.push(`rating = $${ratingIndex}`);
    }

    if (params.content !== undefined) {
      const contentIndex = queryParams.push(params.content);
      setClauses.push(`content = $${contentIndex}`);
    }

    if (params.images !== undefined) {
      const imagesIndex = queryParams.push(params.images);
      setClauses.push(`images = $${imagesIndex}`);
    }

    if (params.difficulty !== undefined) {
      const difficultyIndex = queryParams.push(params.difficulty);
      setClauses.push(`difficulty = $${difficultyIndex}`);
    }

    if (params.playedAt !== undefined) {
      const playedAtIndex = queryParams.push(params.playedAt);
      setClauses.push(`played_at = $${playedAtIndex}`);
    }

    if (params.spoilerWarning !== undefined) {
      const spoilerWarningIndex = queryParams.push(params.spoilerWarning);
      setClauses.push(`spoiler_warning = $${spoilerWarningIndex}`);
    }

    setClauses.push('updated_at = NOW()');
    const idIndex = queryParams.push(id);

    const result = await this.databaseService.query(
      `UPDATE reviews
       SET ${setClauses.join(', ')}
       WHERE id = $${idIndex}
         AND deleted_at IS NULL`,
      queryParams,
    );

    return (result.rowCount ?? 0) > 0;
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await this.databaseService.query(
      `UPDATE reviews
       SET deleted_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
         AND deleted_at IS NULL`,
      [id],
    );

    return (result.rowCount ?? 0) > 0;
  }

  private mapReviewRow(row: ReviewRow): ReviewEntity {
    return {
      id: row.id,
      userId: row.userId,
      themeId: row.themeId,
      rating: row.rating,
      content: row.content,
      images: row.images,
      difficulty: row.difficulty,
      playedAt: row.playedAt,
      spoilerWarning: row.spoilerWarning,
      createdAt: this.toIsoString(row.createdAt),
      updatedAt: this.toIsoString(row.updatedAt),
      user: {
        id: row.authorId,
        name: row.authorName,
        avatar: row.authorAvatar,
      },
      likeCount: row.likeCount,
    };
  }

  private toIsoString(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}
