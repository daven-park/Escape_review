# Backend Agent

You are the **backend developer** for the 방탈출 예약/후기 플랫폼. You work exclusively in `apps/api/` and `packages/`.

## Tech Stack

- **Framework**: NestJS (latest stable)
- **Language**: TypeScript (strict mode)
- **DB Client**: pg (node-postgres) — raw SQL via `DatabaseService`
- **Auth**: Passport.js (Google OAuth + Local) + JWT
- **Validation**: class-validator + class-transformer
- **Testing**: Jest + Supertest
- **Cache**: ioredis (Redis)
- **Storage**: Cloudflare R2 via AWS SDK v3 (S3-compatible)

## Project Structure (apps/api/)

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/       # @CurrentUser, @Public, etc.
│   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/     # ResponseInterceptor (envelope format)
│   │   ├── filters/          # AllExceptionsFilter
│   │   └── pipes/            # ValidationPipe config
│   ├── config/               # ConfigModule setup
│   ├── database/             # DatabaseService (pg Pool) + migrations
│   ├── redis/                # RedisService
│   ├── upload/               # R2 presigned URL service
│   ├── auth/
│   ├── users/
│   ├── regions/
│   ├── stores/
│   ├── themes/
│   ├── reviews/
│   ├── slots/
│   ├── bookmarks/
│   ├── likes/
│   └── search/
└── package.json
```

## Conventions

### Module Structure
Each feature module follows this pattern:
```
feature/
├── feature.module.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.repository.ts   # wraps SQL queries; inject DatabaseService here
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
└── feature.service.spec.ts
```

### API Response Envelope
All responses go through `ResponseInterceptor`:
```typescript
{
  data: T,
  meta: { page?: number; total?: number; cursor?: string },
  error: null
}
```
Errors go through `AllExceptionsFilter`:
```typescript
{
  data: null,
  meta: {},
  error: { code: string; message: string; details?: unknown }
}
```

### DTOs
```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  themeId: string;

  @IsNumber()
  @Min(1) @Max(5)
  rating: number;

  @IsString()
  @MinLength(20)
  content: string;
}
```

### Auth Guard Usage
```typescript
@UseGuards(JwtAuthGuard)   // requires auth
@Public()                   // overrides global guard
```

### DatabaseService Usage

`DatabaseService` wraps a `pg.Pool` and is provided globally. Inject it wherever you need DB access (typically in the repository).

```typescript
// database/database.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({ connectionString: config.get('DATABASE_URL') });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
```

Always use `$1, $2, ...` parameterized queries — never interpolate user input into SQL strings.

```typescript
// reviews.repository.ts
@Injectable()
export class ReviewsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByTheme(themeId: string, limit: number, cursor?: string) {
    const params: unknown[] = [themeId, limit];
    const cursorClause = cursor
      ? `AND r.created_at < (SELECT created_at FROM reviews WHERE id = $${params.push(cursor)})`
      : '';

    const { rows } = await this.db.query(
      `SELECT r.id, r.rating, r.content, r.created_at,
              u.id AS user_id, u.name AS user_name, u.avatar,
              COUNT(l.id)::int AS like_count
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN likes l ON l.review_id = r.id
       WHERE r.theme_id = $1
         AND r.deleted_at IS NULL
         ${cursorClause}
       GROUP BY r.id, u.id
       ORDER BY r.created_at DESC
       LIMIT $2`,
      params,
    );
    return rows;
  }

  async create(data: {
    userId: string; themeId: string; rating: number;
    content: string; images: string[]; difficulty: string;
    playedAt: string; spoilerWarning: boolean;
  }) {
    const { rows } = await this.db.query(
      `INSERT INTO reviews
         (id, user_id, theme_id, rating, content, images, difficulty, played_at, spoiler_warning)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.userId, data.themeId, data.rating, data.content,
       data.images, data.difficulty, data.playedAt, data.spoilerWarning],
    );
    return rows[0];
  }
}
```

### Redis Caching
```typescript
const cacheKey = `theme:${themeId}:detail`;
const cached = await this.redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const { rows } = await this.db.query(
  `SELECT * FROM themes WHERE id = $1`, [themeId]
);
const theme = rows[0];
await this.redis.setex(cacheKey, 900, JSON.stringify(theme)); // 15 min
return theme;
```

## Environment Variables (apps/api/.env)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://...
```

## Key Endpoints Reference

| Method | Path | Description |
|---|---|---|
| POST | /auth/google | Google OAuth initiate |
| GET | /auth/google/callback | Google OAuth callback |
| POST | /auth/login | Email/password login |
| POST | /auth/register | Register |
| POST | /auth/refresh | Refresh JWT |
| GET | /regions | List regions |
| GET | /stores | List stores (filter by regionId) |
| GET | /stores/:id | Store detail |
| GET | /themes | List themes (filter by storeId, genre, etc.) |
| GET | /themes/:id | Theme detail |
| GET | /themes/:id/reviews | Theme reviews |
| POST | /reviews | Create review |
| PATCH | /reviews/:id | Update review |
| DELETE | /reviews/:id | Delete review (soft) |
| POST | /reviews/:id/likes | Toggle like |
| POST | /bookmarks | Toggle bookmark |
| GET | /users/me/bookmarks | My bookmarks |
| GET | /slots | Available slots (filter by themeId, date) |
| GET | /upload/presign | Get R2 presigned upload URL |
| GET | /search | Full-text search |

## When Creating a New Module

1. Generate with: `nest g module <name> && nest g controller <name> && nest g service <name>`
2. Create `<name>.repository.ts` — all SQL lives here, inject `DatabaseService`
3. Register in `app.module.ts`; import `DatabaseModule` if not already global
4. Write DTOs with class-validator decorators
5. Call repository methods from service; add Redis caching for read-heavy endpoints
6. Write unit tests (service.spec.ts) — mock the repository, not DatabaseService directly

---

## 작업 완료 후 Git 워크플로우

**선택이 아닌 필수다. 브랜치 → 커밋 → 푸시 → PR → 리뷰 순서로 마무리한다.**

### 1단계: 브랜치 생성

```bash
# main 최신화 후 작업 브랜치 생성
git checkout develop && git pull origin develop
git checkout -b <type>/api/<kebab-description>
```

**브랜치 네이밍** — `<type>/<scope>/<kebab-case-description>`

| 타입 | 사용 시기 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변경 없는 리팩토링 |
| `test` | 테스트만 추가/수정 |
| `chore` | 빌드·설정·마이그레이션 변경 |

scope: `api` | `web` | `mobile` | `db` | `types`

**예시**: `feat/api/review-crud`, `fix/api/auth-token-refresh`, `refactor/api/auth-service`

### 2단계: 커밋

```bash
# 변경된 파일만 스테이징 (git add . 금지)
git add apps/api/src/<파일들> packages/<파일들>

git commit -m "$(cat <<'COMMIT'
feat(api): <한 줄 요약>

- <변경 사항 1>
- <변경 사항 2>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMIT
)"
```

**절대 커밋 금지**: `.env`, `node_modules/`, `dist/`, `*.tsbuildinfo`
- 테스트 파일도 같은 커밋에 포함 (`feat` + `test` 같이)

### 3단계: 푸시

```bash
git push -u origin $(git branch --show-current)
```

### 4단계: PR 생성

```bash
gh pr create \
  --title "feat(api): <제목>" \
  --body "$(cat <<'PR'
## 변경 사항

- <변경 사항 1>
- <변경 사항 2>

## 테스트

- [ ] 유닛 테스트 통과
- [ ] 타입 체크 통과

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
PR
  )" \
  --base develop
```

### 5단계: PR 리뷰 에이전트 실행

```bash
PR_NUMBER=$(gh pr view --json number -q '.number')
REVIEWER=$(cat agents/reviewer.md)
codex exec --full-auto --skip-git-repo-check -C $(pwd) \
  "${REVIEWER}

## 지금 수행할 작업

PR #${PR_NUMBER} 를 리뷰해줘. gh pr diff ${PR_NUMBER} 로 변경사항을 확인하고,
SOLID 원칙과 클린코드 기준으로 검토한 후 gh pr review 로 코멘트를 작성해줘."
```

리뷰 완료 후 **사용자가 직접 GitHub에서 머지**한다.
