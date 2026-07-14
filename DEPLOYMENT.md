# Deployment

## 현재 Production

- Vercel 프로젝트: `joe-private/cashbook`
- Production URL: [https://cashbook-iota-neon.vercel.app](https://cashbook-iota-neon.vercel.app)
- 최초 Production 배포 확인일: 2026-07-13
- 최근 PWA 배포 확인일: 2026-07-14
- 배포 기준 브랜치: `main`

로컬 프로젝트는 `.vercel/project.json`으로 Vercel 프로젝트에 연결된다. `.vercel`과 `.env.local`은 Git에 포함하지 않는다.

Vercel GitHub 앱의 저장소 접근 권한은 아직 연결되지 않았다. 자동 배포를 설정하기 전까지는 아래 CLI 명령으로 Production을 배포한다.

## 현재 변경분의 운영 반영 상태

2026-07-14에 완료한 DB TLS·데이터 무결성·무한 스크롤·Excel 기간 제한 변경은 `lint`, `typecheck`, `test`, `db:check`, 로컬 Production build와 Vercel Preview build를 통과했다. 운영 DB와 Preview 준비 결과는 다음과 같다.

- 실제 Supabase Root 2021 CA로 로컬 strict TLS DB 연결 성공
- Vercel Preview·Production에 `SUPABASE_DB_CA_CERT`를 각각 sensitive·전역 변수 1개로 등록
- Production DB 사전 데이터 검증 통과
- 사용자 요청으로 이번 migration의 DB 백업은 생략했으며 백업은 생성하지 않음
- `0002_lively_impossible_man.sql` Production migration 적용 성공
- migration ledger, RLS, 소유자 `NOT NULL`, `profiles`·복합 소유권 FK, 금액 check, 커서 index, 무소유자 데이터 정리 상태 사후 검증 통과
- Vercel Preview 필수 변수 4개를 sensitive·전역으로 맞추고 배포 `dpl_7jbk7LuXCyLtYR8jjukWT1y4XCBd`를 READY 상태로 확인
- Preview에서 로그인 화면, 보호 경로·Excel 인증 redirect, 거래 API 401, 보안·`private, no-store` header, manifest와 설치 아이콘 응답 및 `icn1` 함수 실행 확인
- Preview 점검용으로 자동 생성된 Vercel 보호 우회 토큰을 점검 직후 폐기하고 잔여 개수 0 확인
- DB migration 후 기존 Production의 로그인 화면·보호 경로 redirect·manifest 정상 응답 확인

아직 완료되지 않은 항목은 다음과 같다.

- 현재 변경분 Production 배포
- 로그인 세션을 사용한 Vercel Preview·Production 런타임 DB 연결 검증
- 로그인 세션 기반 Production 실제 E2E
- Android Chrome·iPhone/iPad 실기기 PWA 설치·세션 확인

아래 절차는 향후 Production DB 변경에도 적용한다. 이번 백업 생략은 사용자 요청에 따른 일회성 예외로 기록하며 일반 절차로 간주하지 않는다.

## Function Region

Production 함수는 `vercel.json`의 `regions: ["icn1"]` 설정으로 서울 리전에 고정한다. Supabase PostgreSQL도 `ap-northeast-2`에 있으므로 서버 함수와 데이터 소스의 장거리 왕복을 피한다.

배포 후 응답의 `X-Vercel-Id`에 함수 실행 리전이 `icn1`로 표시되는지 확인한다.

## DB 런타임 환경변수

DB를 사용하는 로컬, Vercel Preview, Production의 필수 변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `SUPABASE_DB_CA_CERT`

`SUPABASE_SERVICE_ROLE_KEY`는 현재 런타임에서 사용하지 않으므로 Production에 등록하지 않는다. 관리자 권한 기능이 추가될 때만 서버 전용 변수로 등록한다.

환경변수 값은 문서, Git, 이슈, 명령 로그에 기록하지 않는다. Vercel 환경변수를 변경하면 새 Production 배포를 실행한다.

### `SUPABASE_DB_CA_CERT` 취득과 설정

1. Supabase Dashboard의 Database Settings → SSL Configuration에서 현재 프로젝트의 Server root certificate를 받는다.
2. Vercel Project Settings → Environment Variables에 `SUPABASE_DB_CA_CERT`를 Preview와 Production 서버 전용 비밀값으로 등록한다. DB를 사용하는 범위에만 적용하고 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
3. 값은 `BEGIN CERTIFICATE`와 `END CERTIFICATE` 행을 포함한 PEM 전체를 하나의 secret으로 저장한다. Vercel UI에서는 줄바꿈을 그대로 유지하고, 추가 따옴표나 앞뒤 공백을 넣지 않는다.
4. 로컬 `.env.local`에서는 따옴표 안의 멀티라인 PEM 또는 줄바꿈을 문자 `\n`으로 바꾼 값을 사용할 수 있다. 두 형식 모두 앱이 실제 줄바꿈으로 처리한다. 로컬 `dev`, DB migration, DB E2E에는 해당 Supabase 프로젝트의 실제 CA를 사용한다.
5. 인증서 갱신 시에는 비밀값을 교체한 뒤 새로 배포하고 DB 연결을 재검증한다.

DB를 사용하는 어떤 런타임이든 이 인증서가 없으면 앱은 즉시 시작을 중단한다. `npm run db:migrate`와 같이 DB에 접속하는 Drizzle 명령도 실제 인증서가 설정된 실행 환경에서만 수행한다.

### CI 정적 검증 placeholder

`.github/workflows/ci.yml`은 외부 DB에 접속하지 않는 정적 `lint`, `typecheck`, `test`, `db:check`, build만 실행한다. 이 워크플로우의 `SUPABASE_DB_CA_CERT`는 환경변수 형식 검증만 통과하는 의도적 비기능 PEM placeholder다.

- 이 placeholder는 Supabase DB를 인증하지 못하며 실제 런타임, Preview, Production, migration, DB E2E에 사용하지 않는다.
- CI에 DB 통합 테스트를 추가할 때는 격리된 테스트 DB와 해당 DB의 실제 CA를 GitHub secret로 별도 설계한다.

## DB migration과 배포 절차

Production DB 변경은 반드시 다음 순서로 진행한다.

1. **백업**: 운영 DB의 백업 또는 논리 export를 생성하고, 백업 시각·식별자·복원 수단을 비공개 운영 기록에 남긴다. 복원 가능성을 확인하지 않은 백업만으로는 migration을 시작하지 않는다.
2. **사전 데이터 검증**: migration 대상 DB가 운영 DB인지 재확인하고, 소유자가 없는 거래가 없는지, 소유자가 없는 카테고리가 거래에 참조되지 않는지, 거래와 카테고리의 소유권이 일치하는지, 모든 소유자가 `profiles`에 존재하는지, 금액이 지원 상한 이하인지를 검증한다.
3. **Migration 정합성 검증**: `npm run db:check`를 실행한다. 이 명령은 migration 파일 정합성을 확인하며 백업과 데이터 사전 검증을 대체하지 않는다.
4. **Migration 적용**: `DATABASE_URL`과 `SUPABASE_DB_CA_CERT`가 올바른 운영 프로젝트를 가리키는지 확인한 뒤 `npm run db:migrate`를 한 번만 실행한다.
5. **DB 검증**: migration 기록, 제약 조건, 인덱스, 핵심 행 건수를 확인한다. 기존 사용자 로그인과 거래 조회·등록·수정을 배포 전 점검한다.
6. **앱 검증과 배포**: 아래 명령을 통과한 뒤 Production을 배포한다.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx vercel@latest deploy --prod --yes --scope joe-private
```

7. **배포 후 검증**: 로그인·로그아웃, 거래 CRUD, 한국 날짜 경계, 첫 20건과 무한 스크롤 후속 페이지, 검색 전체 합계, 유효한 1년 Excel과 1년 초과 차단, 주요 보안 응답 헤더를 확인한다.

### `0002_lively_impossible_man.sql` 적용 주의사항

- `transactions.user_id` 값이 없는 행이 하나라도 있으면 migration은 즉시 중단된다. 임의 소유자를 추정해 채우지 않는다.
- 소유자가 없는 카테고리가 거래에 참조되면 migration은 즉시 중단된다. 먼저 올바른 소유권을 확인해야 한다.
- 거래와 참조 카테고리의 소유자가 다르면 migration은 즉시 중단된다.
- 카테고리나 거래의 소유자가 `profiles`에 없으면 migration은 즉시 중단된다.
- 기존 거래 금액이 `999,999,999,999원`을 초과하면 migration은 즉시 중단된다.
- 어떤 거래에도 참조되지 않는 구형 무소유자 기본 카테고리는 migration 안에서 정리된다. 백업과 사전 건수 기록으로 예상 범위를 먼저 확인한다.
- 이후 소유자 `NOT NULL`, `profiles` 소유자 FK, 거래–카테고리 복합 소유권 FK, 금액 상한, 커서 정렬 인덱스가 적용된다.

### 롤백 원칙

- migration 전 검증이 실패하면 DB와 앱 배포를 모두 중단하고 데이터 소유권을 먼저 정리한다.
- migration 후 검증이 실패하면 새 앱을 배포하지 않고, 사전에 확인한 백업으로 복원한 뒤 기존 Production을 유지한다.
- 앱 배포 후에만 문제가 생기면 먼저 이전의 검증된 Vercel deployment로 되돌린다. DB 복원이 필요한지는 migration 검증 결과를 기준으로 별도 판단한다.
- Drizzle migration에 자동 down 절차가 있다고 가정하지 않고, 운영 DB에서 제약을 수동 삭제하지 않는다.

## PWA 배포 검증

PWA는 서비스 워커 없이 Manifest와 HTTPS를 사용하는 온라인 설치 방식이다. 배포 후 다음을 확인한다.

- `/manifest.webmanifest`: `200`, `application/manifest+json`
- `/icons/cashbook-192.png`, `/icons/cashbook-512.png`, `/icons/cashbook-maskable-512.png`: `200`, `image/png`
- `/apple-icon.png`: `200`, `image/png`
- Manifest의 `id: "/"`, `start_url: "/dashboard"`, `scope: "/"`, `display: "standalone"`
- 미인증 `/dashboard` 요청이 `/login?next=/dashboard`로 이동
- Chrome DevTools Application에서 Manifest 오류가 없음
- Android Chrome과 iPhone/iPad에서 홈 화면 설치 후 아이콘·이름·standalone 실행 확인
- 세로·가로 화면에서 노치와 홈 인디케이터가 UI를 가리지 않음
- 오프라인에서 과거 장부 데이터가 별도 PWA 캐시로 표시되지 않음

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
- 기본 카테고리는 성공적인 로그인 직후 신규 `profiles` 행이 처음 생성될 때 한 번만 프로비저닝
- 대시보드 합계·최근 내역을 단일 SQL 요청으로 통합
- 당시 Production에서 거래 목록·검색 결과 합계를 단일 SQL 요청으로 확인. 현재 소스는 DB 전체 합계와 20건 커서 페이지 병렬 조회로 변경되었고 Production 배포 전이다.
- 빈 거래 결과에서 목록 0건, 입금·출금 합계 0원을 운영 DB 읽기 쿼리로 확인

## 2026-07-14 PWA 배포 검증

- Vercel 배포 `dpl_AJ35KfrSSoMiJ1t3fvXVVRJfEack`가 Production alias에 연결됨
- Vercel 원격 `npm run build` 통과
- `/manifest.webmanifest`: `200`, `application/manifest+json`, 인증 Proxy 우회 확인
- 일반 192·512, maskable 512, Apple 180 아이콘이 모두 `200`, `image/png`로 응답
- Manifest의 이름, 앱 식별자, 시작 경로, 범위, standalone 표시 방식 확인
- 미인증 `/dashboard`가 `/login?next=%2Fdashboard`로 `307` 이동
- `X-Vercel-Id`에서 서울 함수 리전 `icn1` 확인
- Production 로그인 화면의 Manifest·Apple 아이콘·`viewport-fit=cover` metadata 확인
- 390×844와 844×390 화면에서 가로 overflow 없음
- Android Chrome과 iPhone/iPad의 실제 설치·standalone 실행은 실제 기기에서 추가 확인

## 잔여 운영 항목

- Vercel GitHub 앱 저장소 권한을 연결하기 전까지 Production은 CLI로 배포한다.
- 현재 릴리스 배포·Preview/Production 런타임 검증·로그인 세션 기반 E2E·실기기 PWA 확인이 완료될 때까지 상태를 미완료로 유지한다.
