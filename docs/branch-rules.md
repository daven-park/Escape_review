# 브랜치 규칙 및 Git 워크플로우

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
main (보호됨)
  └─ feat/api/review-crud   ← 에이전트가 작업
       ├─ commit: feat(api): create review CRUD endpoints
       ├─ push → GitHub
       ├─ gh pr create → PR #5 생성
       ├─ 리뷰 에이전트 실행 → PR 코멘트 작성
       └─ 사용자가 GitHub에서 직접 Merge
```

### 단계별 흐름

1. **에이전트 작업 시작** → `git checkout main && git pull && git checkout -b feat/api/<name>`
2. **구현 완료** → `git add <files> && git commit -m "feat(api): ..."`
3. **원격 푸시** → `git push -u origin $(git branch --show-current)`
4. **PR 생성** → `gh pr create --title "..." --base main`
5. **리뷰 에이전트** → SOLID·클린코드 검토 후 `gh pr review` 코멘트 자동 작성
6. **CI 자동 실행** → GitHub Actions: test-api, test-web, type-check, build
7. **사용자 머지** → 리뷰 확인 후 GitHub에서 직접 Squash & Merge

---

## GitHub 브랜치 보호 규칙

`scripts/setup-branch-protection.sh` 를 실행해 자동 설정:

```bash
bash scripts/setup-branch-protection.sh
```

### main 브랜치 보호 규칙 (자동 설정됨)

| 규칙 | 설정값 |
|---|---|
| PR 없이 직접 push 금지 | ✅ |
| 필요 승인 수 | 1명 |
| 필수 CI 체크 | test-api, test-web, type-check |
| 오래된 리뷰 자동 무효화 | ✅ |
| 강제 push 금지 | ✅ |
| 브랜치 삭제 금지 | ✅ |

---

## 커밋 메시지 형식 (Conventional Commits)

```
<type>(<scope>): <한 줄 요약>

- <변경 사항 상세>
- <변경 사항 상세>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### 예시

```
feat(api): add review CRUD endpoints with image upload

- POST /api/v1/reviews - create review with images[]
- GET /api/v1/reviews?themeId=xxx - paginated list
- PATCH /api/v1/reviews/:id - update (owner only)
- DELETE /api/v1/reviews/:id - soft delete

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## PR 제목 규칙

PR 제목은 커밋 메시지 첫 줄과 동일하게:

```
feat(api): add review CRUD endpoints with image upload
fix(web): resolve login redirect loop on OAuth callback
refactor(api): extract token issuance logic to AuthTokenService
```

---

## Merge 전략

- **Squash & Merge** 사용 (feature 브랜치의 여러 커밋을 하나로)
- Merge 후 브랜치 자동 삭제 (GitHub Settings에서 설정)
- main에는 항상 녹색(CI 통과) 커밋만 존재
