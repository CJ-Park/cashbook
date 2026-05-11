# AGENTS.md

## 프로젝트 목적

`cashbook`은 어머니 전용 개인 입출금 장부 웹앱이다. 수기로 관리하던 입출금 내역을 웹에서 쉽게 입력하고, 기간별/카테고리별/입금·출금별 합계와 엑셀 자료를 빠르게 확인하는 것이 목표다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Drizzle ORM
- Vercel
- 엑셀 다운로드: `xlsx` 또는 적절한 서버리스 호환 라이브러리

## 작업 원칙

- MVP를 우선한다. 과도한 아키텍처, 추상화, 확장 기능을 먼저 만들지 않는다.
- `src/app`은 라우팅 중심으로 얇게 유지한다.
- 기능 코드는 `src/features`에 기능 단위로 둔다.
- 공통 UI, 레이아웃, 유틸은 `src/shared`에 둔다.
- DB client, schema, migration 관련 코드는 `src/db`에 둔다.
- 기본은 Server Component를 사용한다.
- 상태, 이벤트, 브라우저 API가 필요한 경우에만 Client Component를 사용한다.
- 등록/수정/삭제는 Server Action을 우선한다.
- 엑셀 다운로드는 Route Handler에서 처리한다.

## 보안 규칙

- `DATABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트에 노출하지 않는다.
- 브라우저에는 `NEXT_PUBLIC_` 환경변수만 노출한다.
- 인증되지 않은 사용자는 로그인 화면으로 보낸다.
- 모든 장부 페이지는 로그인 후 접근 가능해야 한다.
- 초기 MVP는 단일 가족 장부로 단순하게 구현한다.

## 데이터 규칙

- 금액은 DB에 `bigint`로 저장한다.
- 화면에서는 원화 콤마 포맷을 적용한다.
- 날짜는 한국 사용자를 기준으로 다룬다.
- 목록과 합계는 반드시 같은 검색 조건을 사용한다.
- 합계는 프론트 현재 페이지 데이터가 아니라 DB 기준으로 계산한다.
- DB 변경은 Drizzle schema와 migration으로 관리한다.

## UX 규칙

- 어머니가 사용할 수 있도록 화면은 매우 단순하게 만든다.
- 버튼은 큼직하게 만든다.
- 입력 항목은 최소화한다.
- 날짜 기본값은 오늘 날짜로 둔다.
- 입출금 등록 화면에는 `저장`, `저장 후 계속 입력` 버튼을 제공한다.
- 목록 화면 상단에 검색 결과 입금 합계, 출금 합계, 차액을 바로 보여준다.
- 카테고리명은 실제 사용자가 쓰는 표현을 사용할 수 있어야 한다.

## 작업 전 체크리스트

- 현재 브랜치가 작업 목적에 맞는지 확인한다.
- `TASKS.md`의 Phase 단위로 작업 범위를 제한한다.
- 관련 문서의 요구사항을 먼저 확인한다.

## 작업 후 체크리스트

- 변경 파일이 요청 범위를 벗어나지 않았는지 확인한다.
- 가능하면 `npm run lint`, `npm run typecheck`, `npm run build`를 실행한다.
- 문서와 구현이 어긋나면 문서를 함께 갱신한다.

## 실행 예정 명령어

프로젝트 생성 이후 아래 명령을 사용할 예정이다.

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
