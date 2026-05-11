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
