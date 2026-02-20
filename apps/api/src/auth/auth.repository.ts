import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export type AuthProvider = 'GOOGLE' | 'LOCAL';

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: AuthProvider;
  password_hash: string | null;
  refresh_token: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUserWithSecrets extends AuthUser {
  passwordHash: string | null;
  refreshTokenHash: string | null;
}

interface CreateLocalUserParams {
  email: string;
  name: string;
  passwordHash: string;
}

interface UpsertGoogleUserParams {
  email: string;
  name: string;
  avatar: string | null;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string): Promise<AuthUserWithSecrets | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT id, email, name, avatar, provider, password_hash, refresh_token, created_at, updated_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findById(userId: string): Promise<AuthUserWithSecrets | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT id, email, name, avatar, provider, password_hash, refresh_token, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async createLocalUser(params: CreateLocalUserParams): Promise<AuthUserWithSecrets> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (id, email, name, provider, password_hash)
       VALUES (gen_random_uuid()::text, $1, $2, 'LOCAL', $3)
       RETURNING id, email, name, avatar, provider, password_hash, refresh_token, created_at, updated_at`,
      [params.email, params.name, params.passwordHash],
    );

    return this.mapRow(rows[0]);
  }

  async upsertGoogleUser(params: UpsertGoogleUserParams): Promise<AuthUserWithSecrets> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (id, email, name, avatar, provider)
       VALUES (gen_random_uuid()::text, $1, $2, $3, 'GOOGLE')
       ON CONFLICT (email)
       DO UPDATE
         SET name = EXCLUDED.name,
             avatar = COALESCE(EXCLUDED.avatar, users.avatar),
             provider = 'GOOGLE',
             updated_at = NOW()
       RETURNING id, email, name, avatar, provider, password_hash, refresh_token, created_at, updated_at`,
      [params.email, params.name, params.avatar],
    );

    return this.mapRow(rows[0]);
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.db.query(
      `UPDATE users
       SET refresh_token = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, refreshTokenHash],
    );
  }

  private mapRow(row: UserRow): AuthUserWithSecrets {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      provider: row.provider,
      passwordHash: row.password_hash,
      refreshTokenHash: row.refresh_token,
      createdAt: this.toIsoString(row.created_at),
      updatedAt: this.toIsoString(row.updated_at),
    };
  }

  private toIsoString(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}
