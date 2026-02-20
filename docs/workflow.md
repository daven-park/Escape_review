# Codex CLI Workflow Guide

This guide shows how to use Codex CLI with role-specific agents to build features on this project.

## Setup

```bash
# Install Codex CLI (if not already installed)
npm install -g @openai/codex

# From the project root, all agent paths are relative
cd /path/to/escape-review
```

## Agent Reference

| Agent File | Use For |
|---|---|
| `agents/orchestrator.md` | Planning, architecture decisions, task decomposition |
| `agents/backend.md` | NestJS modules, controllers, services, DTOs |
| `agents/frontend-web.md` | Next.js pages, React components, hooks |
| `agents/frontend-mobile.md` | Expo screens, React Native components |
| `agents/database.md` | SQL migrations, seed data, query patterns, indexes |
| `agents/tester.md` | Unit tests, e2e tests, test utilities |

---

## Common Workflows

### 1. Planning a New Feature

Use the orchestrator to break down a feature:

```bash
codex --system agents/orchestrator.md \
  "후기 작성 기능을 구현하고 싶어. 필요한 작업 목록을 만들고 각 에이전트에 위임할 사항을 정리해줘"
```

### 2. DB Schema Changes

Add a new field or model:

```bash
# Add a field
codex --system agents/database.md \
  "available_slots 테이블에 price (INTEGER, nullable) 컬럼을 추가하는 마이그레이션 SQL 파일 생성해줘"

# Add a new table
codex --system agents/database.md \
  "reports 테이블 추가 (id, user_id, review_id, reason, created_at). FK, 인덱스도 포함해줘"
```

### 3. Backend — New Module

Create a NestJS feature module:

```bash
# Basic CRUD module
codex --system agents/backend.md \
  "apps/api/src에 Bookmarks 모듈을 생성해줘. POST/DELETE /bookmarks, GET /users/me/bookmarks 엔드포인트 포함. JWT 인증 필수"

# Module with specific business logic
codex --system agents/backend.md \
  "apps/api/src/reviews에 좋아요 토글 기능 추가. POST /reviews/:id/likes — 이미 좋아요한 경우 취소"
```

### 4. Backend — Search

```bash
codex --system agents/backend.md \
  "apps/api/src/search 모듈 구현. GET /search?q=&type=theme|store|all. PostgreSQL full-text search 사용. 결과를 tabs 형태로 반환"
```

### 5. Web — New Page

```bash
# Simple page
codex --system agents/frontend-web.md \
  "apps/web/app/themes/[id]/page.tsx 구현. 테마 정보 (포스터, 이름, 장르 뱃지, 난이도, 인원, 시간), 평균 평점, 후기 목록 포함. shadcn/ui Card 사용"

# Form page
codex --system agents/frontend-web.md \
  "apps/web/app/themes/[id]/review/page.tsx 구현. React Hook Form + Zod 검증. 별점(0.5단위), 텍스트(최소 20자), 이미지 업로드(최대 5장), 난이도 선택, 날짜 선택, 스포일러 토글"
```

### 6. Web — Component

```bash
codex --system agents/frontend-web.md \
  "apps/web/components/review/StarRating.tsx 컴포넌트 구현. 0.5단위 별점 선택 가능. readOnly prop으로 표시 전용 모드 지원"
```

### 7. Mobile — New Screen

```bash
codex --system agents/frontend-mobile.md \
  "apps/mobile/app/theme/[id].tsx 구현. 테마 상세 정보와 후기 목록 표시. FlashList로 무한 스크롤. NativeWind 스타일링"
```

### 8. Tests

```bash
# Backend service unit test
codex --system agents/tester.md \
  "apps/api/src/reviews/reviews.service.spec.ts 작성. findByTheme, create, delete 메서드 테스트. ReviewsRepository와 Redis mock 사용"

# Backend e2e test
codex --system agents/tester.md \
  "apps/api/test/reviews.e2e-spec.ts 작성. POST/GET/DELETE /api/v1/reviews 엔드포인트 테스트. 인증 흐름 포함"

# Web component test
codex --system agents/tester.md \
  "apps/web/__tests__/ReviewCard.test.tsx 작성. 스포일러 블러 토글 동작 포함"
```

---

## Full Feature Example: 후기 작성 기능

Following the orchestrator's delegation plan:

```bash
# Step 1: DB (if schema change needed)
codex --system agents/database.md \
  "reviews 테이블 확인 — docs/data-models.md 참고. 현재 스키마에서 빠진 컬럼 있으면 마이그레이션 SQL 파일 생성"

# Step 2: Backend — Review module
codex --system agents/backend.md \
  "apps/api/src/reviews 모듈 생성. CRUD 엔드포인트 + Cloudflare R2 이미지 URL 저장. docs/data-models.md의 Review 모델 기준"

# Step 3: Backend — Upload presign endpoint
codex --system agents/backend.md \
  "apps/api/src/upload 모듈에 GET /upload/presign?type=review 엔드포인트 추가. Cloudflare R2 presigned URL 반환"

# Step 4: Web — Review form
codex --system agents/frontend-web.md \
  "apps/web/app/themes/[id]/review/page.tsx 구현. R2 presigned URL로 이미지 직접 업로드 후 URL 배열로 API 전송"

# Step 5: Mobile — Review form
codex --system agents/frontend-mobile.md \
  "apps/mobile/app/review/[id].tsx 구현. expo-image-picker로 이미지 선택 + R2 업로드"

# Step 6: Tests
codex --system agents/tester.md \
  "reviews 기능 전체 테스트 작성 — service.spec.ts, e2e-spec.ts, ReviewForm.test.tsx"
```

---

## Tips

- **Always check `docs/data-models.md`** before modifying the schema — it's the canonical reference
- **Shared types go in `packages/types/`** — update them when API contracts change
- **Run `npx turbo run type-check`** after adding new types to catch cross-package issues
- **Cache invalidation**: Tell the backend agent which Redis keys to invalidate when writing mutations
- **Feature flags**: Not used in this project — ship complete features to a branch

## Turbo Filters

```bash
# Run only affected packages
npx turbo run test --filter=[HEAD^1]

# Run specific app
npx turbo run dev --filter=api
npx turbo run dev --filter=web
npx turbo run dev --filter=mobile

# Run all but one
npx turbo run build --filter=!mobile
```
