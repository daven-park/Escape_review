# 직접 설정해야 하는 항목 가이드

이 파일은 개발자가 **직접 손으로 설정**해야 하는 외부 서비스 및 환경변수를 정리한다.
에이전트(AI)는 이 파일의 값을 추측하거나 임의로 채우지 않는다.

---

## 체크리스트

```
[ ] 1. PostgreSQL 로컬 DB 생성
[ ] 2. Redis 실행
[ ] 3. Google Cloud — OAuth 2.0 자격증명 발급
[ ] 4. Cloudflare R2 — 버킷 생성 + API 토큰 발급
[ ] 5. JWT Secret 생성
[ ] 6. .env 파일 작성 (apps/api, apps/web, apps/mobile)
[ ] 7. Google Cloud — 승인된 리디렉션 URI 등록
```

---

## 1. PostgreSQL 로컬 DB 생성

```bash
# PostgreSQL 설치 (macOS)
brew install postgresql@16
brew services start postgresql@16

# DB 및 사용자 생성
psql postgres
CREATE USER escape_user WITH PASSWORD 'your_password';
CREATE DATABASE escape_review OWNER escape_user;
CREATE DATABASE escape_review_test OWNER escape_user;  -- e2e 테스트용
\q
```

**`apps/api/.env` 에 기입:**
```
DATABASE_URL=postgresql://escape_user:your_password@localhost:5432/escape_review
DATABASE_URL_TEST=postgresql://escape_user:your_password@localhost:5432/escape_review_test
```

---

## 2. Redis 실행

```bash
# Redis 설치 (macOS)
brew install redis
brew services start redis

# 연결 확인
redis-cli ping  # → PONG
```

**`apps/api/.env` 에 기입:**
```
REDIS_URL=redis://localhost:6379
```

---

## 3. Google OAuth 2.0 자격증명 발급

### 3-1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 (예: `escape-review`)
3. **API 및 서비스 → OAuth 동의 화면** 설정
   - 앱 이름: `방탈출 리뷰`
   - 사용자 유형: 외부
   - 스코프: `email`, `profile`, `openid`
4. **API 및 서비스 → 사용자 인증 정보 → 자격증명 만들기 → OAuth 2.0 클라이언트 ID**

### 3-2. 웹 애플리케이션 (백엔드 + 웹)

- 애플리케이션 유형: **웹 애플리케이션**
- 승인된 JavaScript 원본: `http://localhost:3000`, `http://localhost:3001`
- 승인된 리디렉션 URI:
  - `http://localhost:3000/api/v1/auth/google/callback` (개발)
  - `https://yourdomain.com/api/v1/auth/google/callback` (프로덕션, 나중에 추가)

**`apps/api/.env` 에 기입:**
```
GOOGLE_CLIENT_ID=발급받은_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=발급받은_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

### 3-3. 모바일 앱 (iOS / Android)

- **iOS**: 애플리케이션 유형 → iOS, 번들 ID 입력 (예: `com.yourname.escapereview`)
- **Android**: 애플리케이션 유형 → Android, 패키지 이름 + SHA-1 서명 인증서 입력

**`apps/mobile/.env` 에 기입:**
```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=iOS용_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=Android용_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=웹용_CLIENT_ID.apps.googleusercontent.com
```

---

## 4. Cloudflare R2 버킷 생성 + API 토큰 발급

### 4-1. 버킷 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. **버킷 만들기** → 이름: `escape-review-images`
3. (선택) 커스텀 도메인 연결: 버킷 설정 → 공개 액세스 → 도메인 연결

### 4-2. API 토큰 발급

1. **R2 → 개요 → API 토큰 관리**
2. **토큰 만들기** → 권한: `객체 읽기 및 쓰기` → 버킷: `escape-review-images` 지정
3. 발급된 **Account ID**, **Access Key ID**, **Secret Access Key** 저장

### 4-3. 공개 URL 확인

- 버킷 → **설정** → **공개 URL** (예: `https://pub-xxxx.r2.dev`)
- 커스텀 도메인 연결 시 해당 도메인 사용

**`apps/api/.env` 에 기입:**
```
R2_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=escape-review-images
R2_PUBLIC_URL=https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev
```

---

## 5. JWT Secret 생성

터미널에서 직접 생성한다:

```bash
# JWT_SECRET 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET 생성 (위와 다른 값이어야 함)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**`apps/api/.env` 에 기입:**
```
JWT_SECRET=생성된_64바이트_hex_문자열
JWT_REFRESH_SECRET=생성된_또다른_64바이트_hex_문자열
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
```

⚠️ 두 값은 반드시 서로 달라야 한다.

---

## 6. .env 파일 작성

각 `.env.example`을 복사해 실제 값을 채운다:

```bash
cp apps/api/.env.example     apps/api/.env
cp apps/web/.env.example     apps/web/.env.local
cp apps/mobile/.env.example  apps/mobile/.env
```

**파일별 최소 필수 항목 요약:**

### `apps/api/.env` (필수)

| 항목 | 설명 |
|---|---|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `REDIS_URL` | Redis 연결 문자열 |
| `JWT_SECRET` | 액세스 토큰 서명 키 |
| `JWT_REFRESH_SECRET` | 리프레시 토큰 서명 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 Secret |
| `GOOGLE_CALLBACK_URL` | OAuth 콜백 URL |
| `R2_ACCOUNT_ID` | Cloudflare 계정 ID |
| `R2_ACCESS_KEY_ID` | R2 API 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | R2 API 시크릿 키 |
| `R2_BUCKET_NAME` | R2 버킷 이름 |
| `R2_PUBLIC_URL` | R2 공개 접근 URL |

### `apps/web/.env.local` (필수)

| 항목 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 API 주소 |

### `apps/mobile/.env` (필수)

| 항목 | 설명 |
|---|---|
| `EXPO_PUBLIC_API_URL` | 백엔드 API 주소 |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS 클라이언트 ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android 클라이언트 ID |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth 웹 클라이언트 ID |

---

## 7. .gitignore 확인

아래 파일들이 `.gitignore`에 포함되어 있는지 확인한다:

```
.env
.env.local
.env.*.local
apps/api/.env
apps/web/.env.local
apps/mobile/.env
```

현재 프로젝트 루트의 `.gitignore`에 이미 포함되어 있다.

---

## 보안 주의사항

| 항목 | 주의 |
|---|---|
| `.env` 파일 | 절대 git 커밋 금지 |
| `JWT_SECRET` | 프로덕션과 개발 환경에서 서로 다른 값 사용 |
| R2 API 토큰 | 최소 권한 원칙: 버킷 단위로 권한 제한 |
| Google OAuth | 프로덕션 리디렉션 URI는 콘솔에서 명시적으로 등록 |
| DB 비밀번호 | 추측 불가능한 복잡한 비밀번호 사용 |
| 비밀값 교체 | 유출 의심 시 즉시 모든 Secret 재발급 후 서버 재시작 |
