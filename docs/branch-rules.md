# 브랜치 규칙 및 Git 워크플로우

## Git Flow 전략

```
main        ← 운영(production) 전용. develop → main PR로만 반영
  └─ develop      ← 개발 통합 브랜치. feature → develop PR로만 반영
       ├─ feat/<scope>/<name>     ← 에이전트 기능 구현
       ├─ fix/<scope>/<name>      ← 에이전트 버그 수정
       ├─ refactor/<scope>/<name> ← 에이전트 리팩토링
       └─ test/<scope>/<name>     ← 에이전트 테스트 추가
```

### 브랜치 역할

| 브랜치 | 역할 | 직접 push | PR 대상 |
|---|---|---|---|
| `main` | 운영 배포 | 🚫 금지 | develop → main (릴리즈) |
| `develop` | 개발 통합 | 🚫 금지 | feature → develop (기능 반영) |
| `feat/*` | 기능 구현 | ✅ 에이전트 작업 | develop |

---

## 브랜치 네이밍 규칙

```
<type>/<scope>/<kebab-case-description>
```

### 타입

| 타입 | 사용 시기 | 예시 |
|---|---|---|
| `feat` | 새 기능 | `feat/api/review-crud` |
| `fix` | 버그 수정 | `fix/web/login-redirect` |
| `refactor` | 동작 변경 없는 리팩토링 | `refactor/api/auth-service` |
| `test` | 테스트만 추가/수정 | `test/api/review-service` |
| `chore` | 빌드·설정·마이그레이션 | `chore/db/add-price-column` |
| `docs` | 문서 변경 | `docs/update-readme` |

### 스코프 (scope)

| 스코프 | 작업 영역 |
|---|---|
| `api` | `apps/api/` — NestJS 백엔드 |
| `web` | `apps/web/` — Next.js 웹 |
| `mobile` | `apps/mobile/` — Expo 모바일 |
| `db` | DB 마이그레이션, 스키마 |
| `types` | `packages/types/` |
| `utils` | `packages/utils/` |

---

## 전체 워크플로우

```
[에이전트 작업]
  develop 최신화
    └─ feat/api/review-crud 생성
         ├─ 구현 → commit
         ├─ push → GitHub
         ├─ PR #N 생성 (base: develop)
         ├─ 리뷰 에이전트 → PR 코멘트
         └─ 사용자가 develop으로 Merge ✅

[릴리즈]
  develop → main PR (사용자가 직접)
    └─ 운영 배포
```

### 단계별 흐름 (에이전트 기준)

1. **브랜치 생성** → `git checkout develop && git pull origin develop && git checkout -b feat/<scope>/<name>`
2. **구현 완료** → `git add <files> && git commit -m "feat(<scope>): ..."`
3. **원격 푸시** → `git push -u origin $(git branch --show-current)`
4. **PR 생성** → `gh pr create --title "..." --base develop`
5. **리뷰 에이전트** → SOLID·클린코드 검토 후 `gh pr review` 코멘트 자동 작성
6. **CI 자동 실행** → GitHub Actions: test, type-check, build
7. **사용자 머지** → 리뷰 확인 후 GitHub에서 직접 Squash & Merge → develop

---

## GitHub 브랜치 보호 규칙

```bash
bash scripts/setup-branch-protection.sh
```

### main 브랜치 보호 (운영 보호)

| 규칙 | 설정값 |
|---|---|
| PR 없이 직접 push 금지 | ✅ |
| 필요 승인 수 | 1명 |
| 필수 CI 체크 | test-api, test-web, type-check |
| 오래된 리뷰 자동 무효화 | ✅ |
| 강제 push 금지 | ✅ |

### develop 브랜치 보호 (개발 통합 보호)

| 규칙 | 설정값 |
|---|---|
| PR 없이 직접 push 금지 | ✅ |
| 필요 승인 수 | 1명 |
| 필수 CI 체크 | test-api, test-web, type-check |
| 강제 push 금지 | ✅ |

---

## 커밋 메시지 형식 (Conventional Commits)

```
<type>(<scope>): <한 줄 요약>

- <변경 사항 상세>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## PR 제목 규칙

```
feat(api): add review CRUD endpoints with image upload   → develop
fix(web): resolve login redirect loop on OAuth callback  → develop
release: v1.2.0                                          → main (릴리즈)
```

---

## Merge 전략

- **feature → develop**: Squash & Merge (feature 커밋 하나로 정리)
- **develop → main**: Merge commit (릴리즈 히스토리 보존)
- Merge 후 feature 브랜치 자동 삭제
