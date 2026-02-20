# Data Models

DB 클라이언트: `pg` (node-postgres). 스키마는 `apps/api/src/database/migrations/` 의 SQL 파일들로 관리한다.

---

## SQL Schema

### Enums

```sql
-- 001_create_enums.sql
CREATE TYPE auth_provider AS ENUM ('GOOGLE', 'LOCAL');

CREATE TYPE genre AS ENUM (
  'HORROR', 'THRILLER', 'SF', 'FANTASY',
  'MYSTERY', 'ROMANCE', 'ADVENTURE', 'OTHER'
);

CREATE TYPE difficulty_label AS ENUM ('EASY', 'NORMAL', 'HARD', 'VERY_HARD');
```

### users

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar        TEXT,
  provider      auth_provider NOT NULL DEFAULT 'LOCAL',
  password_hash TEXT,                        -- NULL for Google OAuth users
  refresh_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### regions

```sql
CREATE TABLE regions (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name      TEXT NOT NULL,                   -- e.g. '홍대', '강남'
  city      TEXT NOT NULL,                   -- e.g. '서울'
  latitude  DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_regions_city ON regions(city);
```

### stores

```sql
CREATE TABLE stores (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  region_id  TEXT NOT NULL REFERENCES regions(id),
  address    TEXT NOT NULL,
  phone      TEXT,
  website    TEXT,
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_region_id ON stores(region_id);
CREATE INDEX idx_stores_name      ON stores(name);
```

### themes

```sql
CREATE TABLE themes (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id    TEXT NOT NULL REFERENCES stores(id),
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  genre       genre NOT NULL,
  difficulty  SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  player_min  SMALLINT NOT NULL,
  player_max  SMALLINT NOT NULL,
  duration    SMALLINT NOT NULL,           -- 분 단위
  booking_url TEXT,
  poster_url  TEXT,
  fear_level  SMALLINT NOT NULL DEFAULT 0 CHECK (fear_level BETWEEN 0 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_themes_store_id   ON themes(store_id);
CREATE INDEX idx_themes_genre      ON themes(genre);
CREATE INDEX idx_themes_difficulty ON themes(difficulty);
```

### available_slots

```sql
CREATE TABLE available_slots (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theme_id     TEXT NOT NULL REFERENCES themes(id),
  date         DATE NOT NULL,
  time         TEXT NOT NULL,              -- "HH:mm"
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  price        INTEGER,                   -- KRW, nullable
  UNIQUE (theme_id, date, time)
);

CREATE INDEX idx_slots_theme_date ON available_slots(theme_id, date);
```

### reviews

```sql
CREATE TABLE reviews (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id),
  theme_id        TEXT NOT NULL REFERENCES themes(id),
  rating          NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  content         TEXT NOT NULL,
  images          TEXT[] NOT NULL DEFAULT '{}',   -- R2 public URLs
  difficulty      difficulty_label NOT NULL,
  played_at       DATE NOT NULL,
  spoiler_warning BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,                    -- soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_theme_created ON reviews(theme_id, created_at DESC);
CREATE INDEX idx_reviews_user_id       ON reviews(user_id);
```

### likes

```sql
CREATE TABLE likes (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id   TEXT NOT NULL REFERENCES users(id),
  review_id TEXT NOT NULL REFERENCES reviews(id),
  UNIQUE (user_id, review_id)
);

CREATE INDEX idx_likes_review_id ON likes(review_id);
```

### bookmarks

```sql
CREATE TABLE bookmarks (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT NOT NULL REFERENCES users(id),
  theme_id   TEXT NOT NULL REFERENCES themes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, theme_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
```

### Full-Text Search Columns

```sql
-- 007_add_full_text_search.sql
ALTER TABLE themes ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_themes_search ON themes USING GIN(search_vector);

ALTER TABLE stores ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', name)) STORED;

CREATE INDEX idx_stores_search ON stores USING GIN(search_vector);
```

---

## Entity Relationships

```
users ──< reviews ──< likes >── users
      ──< bookmarks >── themes
                          │
regions ──< stores ──< themes ──< available_slots
```

---

## Key Design Decisions

### IDs
- `gen_random_uuid()::text` — UUID를 TEXT로 저장. URL-friendly하고 API 응답 타입이 일관적
- `pg_crypto` 확장 필요: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

### Soft Delete
- `reviews.deleted_at` — 관리자 복구 가능, Like/Bookmark 집계 유지
- 모든 review 조회 쿼리에 `AND deleted_at IS NULL` 필수

### Ratings
- `NUMERIC(2,1)` — 0.5 단위 별점 (예: 4.5)
- 평균은 `AVG(rating)::numeric(3,2)` 로 집계 후 Redis 캐시

### Images
- `TEXT[]` — PostgreSQL 배열로 R2 public URL 목록 저장
- 최대 5장 제한은 API 레이어에서 검증 (DB 제약 아님)

### Slots
- `date DATE` + `time TEXT("HH:mm")` — 단순하고 직관적
- `UNIQUE (theme_id, date, time)` — 중복 슬롯 방지

### Column Naming
- DB 컬럼: `snake_case` (PostgreSQL 관례)
- TypeScript/API: `camelCase` 로 변환은 repository 레이어에서 수동 또는 헬퍼 함수로 처리

---

## Shared TypeScript Types (`packages/types/src/`)

```typescript
// types/theme.ts
export type Genre =
  | 'HORROR' | 'THRILLER' | 'SF' | 'FANTASY'
  | 'MYSTERY' | 'ROMANCE' | 'ADVENTURE' | 'OTHER';

export type DifficultyLabel = 'EASY' | 'NORMAL' | 'HARD' | 'VERY_HARD';

export interface Theme {
  id: string;
  storeId: string;
  name: string;
  description: string;
  genre: Genre;
  difficulty: number;     // 1–5
  playerMin: number;
  playerMax: number;
  duration: number;       // minutes
  bookingUrl?: string;
  posterUrl?: string;
  fearLevel: number;      // 0–5
  createdAt: string;      // ISO 8601
}

// types/review.ts
export interface Review {
  id: string;
  userId: string;
  themeId: string;
  rating: number;
  content: string;
  images: string[];
  difficulty: DifficultyLabel;
  playedAt: string;       // YYYY-MM-DD
  spoilerWarning: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  likeCount: number;
  isLiked?: boolean;      // present when authenticated
}

// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'GOOGLE' | 'LOCAL';
  createdAt: string;
}
```

---

## camelCase 변환 헬퍼 (packages/utils/src/db.ts)

DB row의 `snake_case` 컬럼명을 API 응답용 `camelCase`로 변환하는 유틸리티:

```typescript
export function toCamel<T extends object>(row: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ])
  ) as T;
}

export function toCamelArray<T extends object>(rows: Record<string, unknown>[]): T[] {
  return rows.map(toCamel<T>);
}
```
