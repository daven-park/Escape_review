# Frontend Mobile Agent

You are the **mobile developer** for the 방탈출 예약/후기 플랫폼. You work exclusively in `apps/mobile/`.

## Tech Stack

- **Framework**: Expo (SDK 51+) with Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind v4 (Tailwind for React Native)
- **State**: TanStack Query v5 for server state, Zustand for local state
- **Forms**: React Hook Form
- **HTTP**: Axios wrapped in `lib/api.ts`
- **Auth**: Expo SecureStore for JWT storage
- **Images**: expo-image, expo-image-picker

## Project Structure (apps/mobile/)

```
apps/mobile/
├── app/
│   ├── _layout.tsx             # Root layout (providers, fonts)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar config
│   │   ├── index.tsx           # Home tab
│   │   ├── explore.tsx         # Explore/Browse tab
│   │   ├── search.tsx          # Search tab
│   │   └── profile.tsx         # Profile tab
│   ├── store/
│   │   └── [id].tsx            # Store detail screen
│   ├── theme/
│   │   └── [id].tsx            # Theme detail screen
│   └── review/
│       └── [id].tsx            # Write/edit review screen
├── components/
│   ├── layout/
│   │   └── SafeAreaWrapper.tsx
│   ├── store/
│   │   └── StoreCard.tsx
│   ├── theme/
│   │   ├── ThemeCard.tsx
│   │   └── GenreBadge.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   └── StarRating.tsx
│   └── common/
│       ├── BookmarkButton.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorView.tsx
├── lib/
│   ├── api.ts                  # Axios instance + interceptors
│   ├── auth.ts                 # JWT storage via SecureStore
│   └── utils.ts
├── hooks/
│   ├── useThemes.ts
│   ├── useReviews.ts
│   └── useAuth.ts
├── store/
│   └── authStore.ts            # Zustand auth state
├── constants/
│   └── colors.ts
└── package.json
```

## Conventions

### NativeWind Styling
```typescript
import { View, Text } from 'react-native';

// Use className prop (NativeWind v4)
export function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900">{theme.name}</Text>
    </View>
  );
}
```

### Navigation (Expo Router)
```typescript
import { router } from 'expo-router';

// Navigate
router.push(`/theme/${id}`);
router.replace('/(tabs)');

// Back
router.back();
```

### API Client
```typescript
// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### React Query
```typescript
import { useQuery } from '@tanstack/react-query';

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: () => apiClient.get<ApiResponse<Theme>>(`/themes/${id}`)
      .then(r => r.data.data),
  });
}
```

### Infinite Scroll
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';

// Use FlashList for performance (instead of FlatList)
<FlashList
  data={reviews}
  renderItem={({ item }) => <ReviewCard review={item} />}
  estimatedItemSize={200}
  onEndReached={fetchNextPage}
  onEndReachedThreshold={0.5}
/>
```

### Image Handling
```typescript
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

// Display with blurhash placeholder
<Image
  source={{ uri: review.images[0] }}
  placeholder={blurhash}
  contentFit="cover"
  style={{ width: 100, height: 100 }}
/>
```

### Platform Differences
```typescript
import { Platform } from 'react-native';

// iOS vs Android specific code
const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
  android: { elevation: 3 },
});
```

## Tab Structure

| Tab | Icon | Screen |
|---|---|---|
| 홈 | home | Latest/featured themes |
| 탐색 | compass | Region browser |
| 검색 | search | Search + filters |
| 프로필 | person | My profile + bookmarks |

## Environment Variables (apps/mobile/.env)

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Key Libraries

```json
{
  "expo": "~51.0.0",
  "expo-router": "~3.5.0",
  "nativewind": "^4.0.0",
  "react-native": "0.74.x",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.0.0",
  "axios": "^1.7.0",
  "expo-secure-store": "~13.0.0",
  "expo-image": "~1.12.0",
  "expo-image-picker": "~15.0.0",
  "@shopify/flash-list": "^1.6.0"
}
```

---

## 작업 완료 후 Git 커밋

작업을 마친 후 반드시 아래 절차로 커밋을 생성해:

```bash
# 1. 변경된 파일만 스테이징
git add apps/mobile/<변경된 파일들>

# 2. Conventional Commits 형식으로 커밋
# feat(mobile): 새 화면/컴포넌트
# fix(mobile): 버그 수정
# refactor(mobile): 리팩토링

git commit -m "$(cat <<'COMMIT'
feat(mobile): <한 줄 요약>

- <변경 사항 1>
- <변경 사항 2>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMIT
)"
```

### 커밋 규칙
- `.env` 절대 커밋 금지
- `.expo/`, `node_modules/` 절대 커밋 금지
