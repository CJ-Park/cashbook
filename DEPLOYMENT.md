# Deployment

## 현재 Production

- Vercel 프로젝트: `joe-private/cashbook`
- Production URL: [https://cashbook-iota-neon.vercel.app](https://cashbook-iota-neon.vercel.app)
- 최초 Production 배포 확인일: 2026-07-13
- 배포 기준 브랜치와 커밋: `main` / `61044e5`

로컬 프로젝트는 `.vercel/project.json`으로 Vercel 프로젝트에 연결된다. `.vercel`과 `.env.local`은 Git에 포함하지 않는다.

Vercel GitHub 앱의 저장소 접근 권한은 아직 연결되지 않았다. 자동 배포를 설정하기 전까지는 아래 CLI 명령으로 Production을 배포한다.

## Function Region

Production 함수는 `vercel.json`의 `regions: ["icn1"]` 설정으로 서울 리전에 고정한다. Supabase PostgreSQL도 `ap-northeast-2`에 있으므로 서버 함수와 데이터 소스의 장거리 왕복을 피한다.

배포 후 응답의 `X-Vercel-Id`에 함수 실행 리전이 `icn1`로 표시되는지 확인한다. Proxy 인증 시간은 `Server-Timing: auth;dur=...` 응답 헤더로 확인할 수 있다.

## Production 환경변수

필수 변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

`SUPABASE_SERVICE_ROLE_KEY`는 현재 런타임에서 사용하지 않으므로 Production에 등록하지 않는다. 관리자 권한 기능이 추가될 때만 서버 전용 변수로 등록한다.

환경변수 값은 문서, Git, 명령 로그에 기록하지 않는다. Vercel 환경변수를 변경하면 새 Production 배포를 실행한다.

## 배포 절차

```bash
npm run lint
npm run typecheck
npm run build
npx vercel@latest deploy --prod --yes --scope joe-private
```

## Supabase Auth URL

현재 앱은 이메일과 비밀번호를 `signInWithPassword`로 직접 검증한다. `redirectTo`, OAuth, 이메일 인증 callback, 비밀번호 재설정 callback을 사용하지 않으므로 현재 MVP 로그인에는 별도 Redirect URL이 필요하지 않다.

다음 기능을 추가할 때 Supabase Authentication의 URL Configuration을 함께 설정한다.

- Site URL: `https://cashbook-iota-neon.vercel.app`
- Local Redirect URL: `http://localhost:3000/**`
- 이메일 인증, 비밀번호 재설정, OAuth에서 사용하는 실제 callback URL

## 2026-07-13 배포 검증

- 로컬 `npm run lint`, `npm run typecheck`, `npm run build` 통과
- Vercel 원격 `npm run build` 통과
- Next.js `16.2.10`, Production 의존성 `npm audit --omit=dev` 취약점 0건
- `/login`: 미인증 요청 `200 OK`
- `/dashboard`, `/transactions`: 미인증 요청 `/login`으로 `307` 리디렉션
- `/api/export`: 미인증 요청 `/login`으로 `307` 리디렉션
- Production Supabase 스키마에서 `categories.user_id`, `transactions.user_id` UUID 확인
- Production Supabase 스키마에서 `transactions.amount` bigint 확인
- 임시 사용자 로그인과 빈 대시보드 확인
- 사용자별 기본 카테고리 16개 자동 생성과 공통 카테고리 추가 확인
- 입금·출금 등록, `저장 후 계속 입력`, 수정, 삭제 확인
- 날짜·구분·카테고리·검색어 동시 필터와 목록·합계 조건 일치 확인
- 대시보드, 월별 통계, 카테고리별 통계 합계 일치 확인
- 동일 검색 조건이 포함된 Excel 다운로드 응답 확인
- 다른 사용자 소유 거래 수정 URL이 `404`로 차단되는지 확인
- 390×844 화면에서 가로 overflow 없음, 모바일 카드 목록과 48px 이상 주요 버튼 확인
- E2E 임시 거래·카테고리·Auth 사용자를 모두 삭제하고 임시 자격정보 제거

## 2026-07-13 성능 개선 검증

- Vercel Function Region을 Supabase와 같은 서울 `icn1`로 고정
- Supabase ES256 JWT를 `getClaims()`로 검증하고, 캐시 후 로컬 검증이 동작하는지 확인
- 등록·수정·삭제 Server Action은 원격 `getUser()` 검증을 유지
- 기본 카테고리는 신규 `profiles` 행이 처음 생성될 때 한 번만 프로비저닝
- 대시보드 합계·최근 내역을 단일 SQL 요청으로 통합
- 거래 목록·검색 결과 합계를 단일 SQL 요청으로 통합
- 빈 거래 결과에서 목록 0건, 입금·출금 합계 0원을 운영 DB 읽기 쿼리로 확인

## 잔여 운영 항목

- Vercel GitHub 앱 저장소 권한을 연결하기 전까지 Production은 CLI로 배포한다.
- `categories.user_id`, `transactions.user_id`의 DB 수준 `NOT NULL`/Auth FK 강화는 기존 소유자 없는 카테고리 정리와 함께 별도 migration으로 진행한다.
- Excel은 전체 검색 결과를 메모리에서 생성하므로 데이터가 수만 건 이상으로 커지면 건수 제한 또는 스트리밍 전략을 검토한다.
