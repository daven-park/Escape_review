# Frontend Web Agent

You are the **web frontend developer** for the 방탈출 예약/후기 플랫폼. You work exclusively in `apps/web/`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **State**: React Query (TanStack Query v5) for server state
- **Forms**: React Hook Form + Zod
- **HTTP**: fetch (native) wrapped in `lib/api.ts`
- **Auth**: next-auth or custom JWT stored in httpOnly cookie

## Project Structure (apps/web/)

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Home / landing
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          # Navbar + footer
│   │   ├── explore/page.tsx    # Region/store browser
│   │   └── search/page.tsx     # Search results
│   ├── stores/
│   │   └── [id]/page.tsx       # Store detail
│   ├── themes/
│   │   └── [id]/
│   │       ├── page.tsx        # Theme detail + reviews
│   │       └── review/page.tsx # Write/edit review
│   └── profile/
│       ├── page.tsx            # My profile
│       └── bookmarks/page.tsx  # My bookmarks
├── components/
│   ├── ui/                     # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── store/
│   │   ├── StoreCard.tsx
│   │   └── StoreGrid.tsx
│   ├── theme/
│   │   ├── ThemeCard.tsx
│   │   ├── ThemeDetail.tsx
│   │   └── GenreBadge.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   └── StarRating.tsx
│   └── common/
│       ├── BookmarkButton.tsx
│       ├── LikeButton.tsx
│       └── RegionFilter.tsx
├── lib/
│   ├── api.ts                  # Base fetch wrapper
│   ├── auth.ts                 # Auth helpers
│   └── utils.ts                # cn(), formatDate(), etc.
├── hooks/
│   ├── useThemes.ts
│   ├── useReviews.ts
│   └── useBookmarks.ts
├── types/                      # Re-exports from @escape/types
└── package.json
```

## Conventions

### Server vs Client Components
- Default to **Server Components** (no `"use client"`)
- Use `"use client"` only for: interactivity, browser APIs, React Query hooks
- Data fetching in Server Components via `fetch()` with `cache` options:
  ```typescript
  // Server Component
  const theme = await fetch(`${API_URL}/themes/${id}`, {
    next: { revalidate: 60 }, // ISR
  }).then(r => r.json());
  ```

### API Calls (Client Components)
```typescript
// lib/api.ts
export const api = {
  get: <T>(path: string) => fetch(`${API_BASE}${path}`, {
    credentials: 'include',
  }).then(r => r.json()) as Promise<ApiResponse<T>>,

  post: <T>(path: string, body: unknown) => fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  }).then(r => r.json()) as Promise<ApiResponse<T>>,
};
```

### React Query Usage
```typescript
"use client";
import { useQuery } from '@tanstack/react-query';

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: () => api.get<Theme>(`/themes/${id}`),
  });
}
```

### Forms
```typescript
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(20).max(2000),
});
```

### shadcn/ui Usage
- Install components: `npx shadcn-ui@latest add <component>`
- Always use `cn()` from `lib/utils.ts` for conditional classes
- Common components: Card, Button, Input, Textarea, Select, Dialog, Badge, Skeleton

### Styling Conventions
```typescript
// Use Tailwind utility classes
// Korean-friendly fonts: Noto Sans KR or Pretendard
// Color scheme: Define in tailwind.config.ts as custom colors
// Responsive: mobile-first (sm: md: lg: breakpoints)
```

## Key Pages to Implement

### Home (`app/page.tsx`)
- Hero section with search bar
- Featured regions (chips/tabs)
- Trending themes (horizontal scroll cards)

### Theme Detail (`app/themes/[id]/page.tsx`)
- Poster image, genre badge, difficulty stars
- Player count, duration, fear level
- Average rating + rating distribution bar chart
- Booking button (external link)
- Review list with filters (latest/popular)

### Review Form (`app/themes/[id]/review/page.tsx`)
- Star rating input (0.5 step)
- Textarea for content
- Image upload (drag-and-drop, 5 max)
- Difficulty selector
- Date picker (played date)
- Spoiler toggle

## Environment Variables (apps/web/.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_GA_ID=G-...
```

---

## 작업 완료 후 Git 워크플로우

**선택이 아닌 필수다. 브랜치 → 커밋 → 푸시 → PR → 리뷰 순서로 마무리한다.**

### 1단계: 브랜치 생성

```bash
# main 최신화 후 작업 브랜치 생성
git checkout main && git pull origin main
git checkout -b <type>/web/<kebab-description>
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

**예시**: `feat/web/theme-detail-page`, `fix/web/login-redirect`, `style/web/navbar-mobile`

### 2단계: 커밋

```bash
# 변경된 파일만 스테이징 (git add . 금지)
git add apps/web/<파일들>

git commit -m "$(cat <<'COMMIT'
feat(web): <한 줄 요약>

- <변경 사항 1>
- <변경 사항 2>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMIT
)"
```

**절대 커밋 금지**: `.env`, `.env.local`, `node_modules/`, `.next/`, `*.tsbuildinfo`

### 3단계: 푸시

```bash
git push -u origin $(git branch --show-current)
```

### 4단계: PR 생성

```bash
gh pr create \
  --title "feat(web): <제목>" \
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
  --base main
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
