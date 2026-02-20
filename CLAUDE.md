# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**방탈출 예약/후기 플랫폼** — An escape room booking and review platform serving Korean users.
Users can discover escape room themes by region, read/write reviews, bookmark favorites, and check available time slots.

## Tech Stack

| Area | Technology |
|---|---|
| Monorepo | Turborepo |
| Web | Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui |
| Mobile | Expo (React Native) + TypeScript + NativeWind |
| Backend | NestJS + TypeScript + pg (node-postgres) |
| DB | PostgreSQL + Redis |
| Auth | Google OAuth 2.0 + Email/Password (JWT) |
| Image Storage | Cloudflare R2 |
| Shared Packages | @escape/types, @escape/utils |

## Monorepo Structure

```
/
├── apps/
│   ├── web/          # Next.js 14 web app
│   ├── mobile/       # Expo React Native app
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # @escape/types — shared TypeScript types
│   └── utils/        # @escape/utils — shared utility functions
├── agents/           # Codex CLI agent instruction files
├── docs/             # Architecture & feature documentation
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace config
```

## Install & Run

```bash
# Install all dependencies
npm install

# Run all apps in dev mode
npm run dev

# Run only backend
npm run dev --filter=api

# Run only web
npm run dev --filter=web

# Run tests
npm run test

# Lint
npm run lint

# Build all
npm run build
```

## Agent Files

This project uses Codex CLI agent files in `agents/` for role-based development:

| File | Role |
|---|---|
| `agents/orchestrator.md` | Overall coordination, architecture decisions |
| `agents/backend.md` | NestJS API development |
| `agents/frontend-web.md` | Next.js web development |
| `agents/frontend-mobile.md` | Expo mobile development |
| `agents/database.md` | SQL schema, migrations, query optimization |
| `agents/tester.md` | Test writing |

See `docs/workflow.md` for Codex CLI usage examples.

## Key Conventions

- All TypeScript — no `any` types without explicit justification
- `pg` (node-postgres) for all DB access via injected `DatabaseService`
- API responses follow `{ data, meta, error }` envelope format
- Auth via JWT Bearer token in Authorization header
- Images stored in Cloudflare R2, URLs stored in DB
- Korean content is primary; English variable/function names

## Architecture Reference

See `docs/architecture.md` for full system diagram and `docs/data-models.md` for DB schema.

---

## Claude Code Sub-Agent Orchestration

**이 섹션은 Claude Code 자신을 위한 지시사항이다.** 사용자가 기능 구현을 요청하면 아래 흐름을 따른다.

### 핵심 원칙

- Claude Code는 **오케스트레이터**다. 직접 코드를 작성하지 말고 Codex 에이전트에 위임한다.
- 각 도메인(db, backend, web, mobile, test)은 **전담 에이전트**가 처리한다.
- 서로 의존성이 없는 작업은 **병렬**로 실행한다.
- 각 에이전트는 `scripts/codex-agent.sh`를 통해 실행한다.

### 실행 흐름

```
사용자 요청
    │
    ▼
Claude Code — 작업 분해 (agents/orchestrator.md 참고)
    │
    ├─── Task(Bash): scripts/codex-agent.sh database  "<SQL 마이그레이션>"
    │                              ↓ 완료 후
    ├─── Task(Bash): scripts/codex-agent.sh backend   "<API 구현>"
    │                              ↓ 완료 후
    ├─── Task(Bash): scripts/codex-agent.sh frontend-web    "<웹 UI>"   ← 병렬
    ├─── Task(Bash): scripts/codex-agent.sh frontend-mobile "<모바일>"  ← 병렬
    │                              ↓ 모두 완료 후
    └─── Task(Bash): scripts/codex-agent.sh tester    "<테스트>"
```

### 사용 가능한 에이전트

| 에이전트 이름 | 파일 | 담당 |
|---|---|---|
| `database` | `agents/database.md` | SQL 마이그레이션, 스키마, 쿼리 |
| `backend` | `agents/backend.md` | NestJS 모듈, 서비스, DTO |
| `frontend-web` | `agents/frontend-web.md` | Next.js 페이지, 컴포넌트 |
| `frontend-mobile` | `agents/frontend-mobile.md` | Expo 화면, 컴포넌트 |
| `tester` | `agents/tester.md` | 단위/e2e/컴포넌트 테스트 |
| `orchestrator` | `agents/orchestrator.md` | 계획 수립, 아키텍처 결정 |

### Task 도구 호출 패턴

기능 구현 요청 시 아래 패턴으로 Task 도구를 호출한다:

```
# 순차 실행 예시 (의존성 있음)
Task(subagent_type=Bash):
  "bash scripts/codex-agent.sh database '리뷰 테이블 마이그레이션 SQL 생성'"

Task(subagent_type=Bash):  ← 위 완료 후
  "bash scripts/codex-agent.sh backend '리뷰 모듈 CRUD API 구현'"

# 병렬 실행 예시 (의존성 없음) — 하나의 메시지에 여러 Task 호출
Task(subagent_type=Bash):
  "bash scripts/codex-agent.sh frontend-web '리뷰 작성 페이지 구현'"
Task(subagent_type=Bash):
  "bash scripts/codex-agent.sh frontend-mobile '리뷰 작성 화면 구현'"
```

### 플랜 파일 사용 (복잡한 기능)

여러 에이전트가 관여하는 경우 `plans/` 의 JSON 플랜 파일로 오케스트레이션한다:

```bash
# 플랜 파일 직접 실행 (Claude Code가 Bash Task로 실행)
bash scripts/orchestrate.sh --plan plans/review-feature.json

# 기존 플랜 파일
plans/review-feature.json   # 후기 작성 기능
plans/auth-feature.json     # 인증 기능
```

### 기능 요청 처리 절차

1. **계획 수립**: `agents/orchestrator.md` 내용을 바탕으로 작업을 분해한다.
2. **의존성 파악**: DB 스키마 → API → 프론트엔드 → 테스트 순서를 지킨다.
3. **Task 생성**: 각 작업을 `Task(subagent_type=Bash)`로 실행한다.
4. **병렬화**: 프론트엔드-웹과 프론트엔드-모바일은 항상 병렬로 실행한다.
5. **완료 확인**: 각 Task 결과를 확인하고 사용자에게 요약한다.

### 주의사항

- `scripts/codex-agent.sh` 는 프로젝트 루트에서 실행해야 한다 (상대경로 때문).
- 각 에이전트 Task는 독립된 Bash 세션이므로 환경변수(`.env`)를 직접 참조하지 않는다.
- 실행 로그는 `.orchestrate-logs/` 에 저장된다 (`.gitignore` 처리 권장).
- Codex CLI가 설치되어 있어야 한다: `npm install -g @openai/codex`
