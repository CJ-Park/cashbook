# DECISIONS.md

프로젝트 진행 중 중요한 설계 결정을 기록한다. 결정이 바뀌면 날짜와 이유를 추가한다.

## 2026-05-11 초기 결정

### Next.js + Supabase + Drizzle + Vercel 사용

- 결정: Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, Drizzle ORM, Vercel을 사용한다.
- 이유: MVP를 빠르게 만들 수 있고, 서버 직접 운영 없이 비용을 낮출 수 있다.

### MVP에서는 하네스 아키텍처 사용하지 않음

- 결정: 초기 MVP에서는 과도한 테스트 하네스나 복잡한 아키텍처를 도입하지 않는다.
- 이유: 사용자 1~2명이 쓰는 개인 장부가 목적이므로 단순성과 유지보수성을 우선한다.

### MVP에서는 soft delete 제외

- 결정: MVP 삭제는 hard delete로 시작한다.
- 이유: 기능 복잡도를 줄이기 위함이다.
- 참고: 추후 복구 요구가 생기면 `deleted_at` 컬럼을 추가해 soft delete로 전환한다.

### MVP에서는 파일 업로드 제외

- 결정: 영수증 이미지 첨부와 기타 파일 업로드는 MVP에서 제외한다.
- 이유: 초기 목적은 장부 데이터 입력, 조회, 합계, 엑셀 다운로드다.
- 참고: 추후 필요하면 Supabase Storage를 검토한다.

### amount는 integer/bigint로 저장

- 결정: 금액은 DB에 `bigint`로 저장한다.
- 이유: 원화 금액은 정수로 다루는 것이 안전하고 계산이 단순하다.
- 화면에서는 콤마 포맷을 적용한다.

### 엑셀 다운로드는 Route Handler에서 직접 응답

- 결정: 엑셀 다운로드는 Next.js Route Handler에서 생성 후 바로 응답한다.
- 이유: Vercel 서버리스 환경에서는 로컬 디스크 저장을 피해야 한다.

### 기본은 Server Component

- 결정: 화면은 기본적으로 Server Component로 구현한다.
- 이유: 데이터 조회 중심 화면이 많고, 클라이언트 상태를 최소화할 수 있다.

### 등록/수정/삭제는 Server Action 우선

- 결정: 입출금과 카테고리의 등록/수정/삭제는 Server Action을 우선 사용한다.
- 이유: App Router 구조에서 폼 처리와 서버 데이터 변경을 단순하게 유지할 수 있다.

### main + 짧은 feature branch 전략 사용

- 결정: MVP에서는 `main` 브랜치와 짧은 `feature/*` 브랜치를 사용한다.
- 이유: Git Flow는 현재 프로젝트 규모에 비해 복잡하다.
- 규칙: 하나의 브랜치는 하나의 목적만 가진다.

## 브랜치 예시

- `feature/docs-init`
- `feature/project-setup`
- `feature/db-schema`
- `feature/auth`
- `feature/transactions-crud`
- `feature/transaction-search-summary`
- `feature/categories`
- `feature/reports`
- `feature/excel-export`
- `chore/vercel-deploy`
- `fix/login-redirect`
- `fix/export-filter-condition`

## 2026-07-10 Excel Export 구현 결정

### SheetJS CE와 거래 검색 조건 재사용

- 결정: 엑셀 생성은 SheetJS CE `xlsx` 0.20.3을 사용하고 `src/app/api/export/route.ts`에서 메모리 버퍼로 응답한다.
- 이유: 금액을 숫자 셀로 유지하면서 Vercel 서버리스 환경에서 파일 시스템 없이 `.xlsx`를 생성할 수 있다.
- 규칙: 거래 목록과 엑셀은 동일한 검색 조건 파서와 DB 조건 생성기를 사용한다. 목록은 커서 페이지 조회, 엑셀은 검증된 기간의 전체 조회를 각각 사용한다.
- 규칙: 엑셀은 시작일과 종료일을 모두 필수로 받고, 양끝 날짜를 모두 포함해 최대 1년만 허용한다. 시작일의 다음 해 기념일 전날이 허용되는 마지막 날이다.
- 규칙: 유효한 다운로드 파일명은 `cashbook_시작일_종료일.xlsx`를 사용한다.

## 2026-07-13 Vercel Production 배포 결정

### CLI Production 배포와 직접 비밀번호 인증 유지

- 결정: Vercel 프로젝트는 `joe-private/cashbook`, Production 주소는 `https://cashbook-iota-neon.vercel.app`을 사용한다.
- 결정: Production에는 현재 런타임에 필요한 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `SUPABASE_DB_CA_CERT`만 등록한다.
- 보안: 현재 사용되지 않는 `SUPABASE_SERVICE_ROLE_KEY`는 최소 권한 원칙에 따라 Production에 등록하지 않는다.
- 인증: 현재 로그인은 `signInWithPassword`를 사용하며 `redirectTo`와 Auth callback route가 없으므로 MVP 로그인은 Supabase Redirect URL에 의존하지 않는다.
- 향후: 이메일 인증, 비밀번호 재설정, OAuth를 추가할 때 Production Site URL과 Redirect Allow List를 함께 설정한다.
- 운영: Vercel GitHub 앱에 `CJ-Park/cashbook` private 저장소 권한을 부여해 작업 브랜치는 Preview, `main`은 Production으로 자동 배포한다. 고위험 변경에는 CLI 후보 배포 → 인증 E2E → promote 절차를 병행한다.

## 2026-07-13 MVP Review 결정

### Production E2E와 보안 보완

- 검증: 임시 Supabase Auth 사용자로 로그인, 카테고리, 입출금 CRUD, 검색·합계, 통계, Excel 다운로드, 모바일 화면을 Production에서 확인했다.
- 정리: E2E 종료 후 임시 거래·카테고리·profile·Auth 사용자와 자격정보를 모두 삭제했다.
- 보안: 로그인 `next` 경로는 백슬래시·외부 origin·제어 문자를 차단하고 내부 pathname만 허용한다.
- 금액: 거래 목록뿐 아니라 대시보드·월별·카테고리 통계도 bigint 합계를 32비트 `int`로 변환하지 않는다.
- 의존성: Next.js를 `16.2.10`으로 올리고 내부 PostCSS를 `8.5.18`로 override하여 Production audit 취약점 0건을 확인했다.
- 데이터: 사용자 ID 없이 카테고리를 만들던 구형 `db:seed`를 제거하고 로그인 사용자별 자동 생성을 단일 경로로 사용한다.
- 후속: 2026-07-14에 Excel 시작일·종료일 필수 및 최대 1년 제한을 구현했다.

## 2026-07-13 Production 성능 개선 결정

### 서울 리전, 로컬 JWT 검증, DB 왕복 축소

- 리전: Vercel Functions를 Supabase와 같은 서울 `icn1`에서 실행한다.
- 인증: 프로젝트의 ES256 JWT를 `getClaims()`로 검증해 페이지 이동마다 Auth 서버로 보내던 `getUser()` 왕복을 제거한다.
- 보안: 화면 조회는 서명·만료가 검증된 claims를 사용하되, 등록·수정·삭제 Server Action은 `getUser()`로 Auth 서버의 최신 사용자 상태를 다시 확인한다.
- 카테고리: 성공적인 로그인 직후 신규 사용자 프로필을 최초 생성하는 트랜잭션에서 기본 카테고리를 한 번만 만든다. 일반 화면 조회에서는 쓰기 쿼리를 실행하지 않는다.
- 조회: 대시보드의 합계·최근 내역은 하나의 SQL 요청으로 통합한다. 거래 화면은 DB 기준 전체 합계와 커서 기반 20건 목록을 분리해 병렬 조회한다.

## 2026-07-14 PWA 설치 지원 결정

### 온라인 설치형 PWA와 무캐시 원칙

- 설치: Next.js App Router의 `manifest.ts`와 HTTPS를 사용해 Android, iOS/iPadOS, 데스크톱에서 앱 설치를 지원한다.
- 실행: 설치 식별자는 `/`, 범위는 `/`, 시작 경로는 `/dashboard`, 표시 방식은 `standalone`으로 고정한다.
- 아이콘: 사용자 제공 `cashbook_fav.png`에서 192×192, 512×512, Android maskable, Apple 180×180 아이콘을 생성한다.
- 보안: 1차 PWA에는 서비스 워커를 등록하지 않으며 인증 HTML/RSC, 거래 내역, 합계, Server Action, Excel 응답을 Cache Storage에 저장하지 않는다.
- 업데이트: 서비스 워커가 없으므로 일반 웹 배포와 동일하게 다음 탐색이나 새로고침에서 최신 버전을 받는다.
- 향후: 오프라인 안내가 필요하면 개인정보가 없는 안내 화면과 공개 정적 자산만 캐시하는 별도 설계를 먼저 진행한다.

## 2026-07-14 전반 점검 후 보강 결정

### 한국 날짜와 거래 무결성

- 날짜: 오늘, 현재 월, 기본 연도는 서버 로컬 타임존이 아닌 `Asia/Seoul`을 명시적으로 사용한다.
- 금액: 한 건의 금액은 `bigint`로 저장하되 앱과 DB에서 `999,999,999,999원` 이하로 제한하고 safe integer를 검증한다. DB 합계와 차액은 JavaScript `number`로 축소하지 않고 `bigint`로 유지한다.
- 카테고리: 거래 구분과 카테고리 타입의 호환성을 서버에서 검증한다. 기존 비활성 카테고리는 기존 거래 편집 시 유지할 수 있지만 새로 선택할 수는 없다.

### 20건 커서 무한 스크롤

- 결정: 거래 목록은 `(transaction_date desc, id desc)` 커서로 20건씩 읽고 `IntersectionObserver`로 후속 페이지를 불러온다.
- 합계: 입금·출금·차액과 전체 건수는 현재 로드된 20건이 아닌 동일 검색 조건의 DB 전체를 기준으로 하며, 금액은 `bigint` 정밀도를 유지한다.
- 응답: 후속 페이지 API는 인증과 사용자 소유권 조건을 같이 적용한다.

### DB TLS와 소유권 제약

- TLS: DB를 사용하는 로컬·Vercel Preview·Production 런타임은 Supabase Server root certificate를 `SUPABASE_DB_CA_CERT`로 전달하고 인증서·호스트 검증을 강제한다. 인증서 값은 문서나 Git에 기록하지 않는다.
- DB: `0002_lively_impossible_man.sql`로 소유자 필수 조건과 `profiles`·카테고리 소유권 FK를 보강한다. 운영에서는 백업, 사전 데이터 검증, `db:check`, migration, DB 검증, 앱 배포 순서를 지킨다.
- CI: 외부 DB에 접속하지 않는 정적 검증에만 의도적 비기능 PEM placeholder를 사용한다. 실제 런타임이나 DB 테스트에는 재사용하지 않는다.
- 상태: 실제 CA를 사용한 로컬 strict TLS DB 연결, Vercel Preview·Production 인증서 등록, Production DB migration·사후 검증, Preview·Production 로그인 세션 E2E, Production 배포와 Git 자동 배포 연결을 완료했다. 실기기 PWA 설치 검증만 남았다.
