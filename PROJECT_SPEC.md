# PROJECT_SPEC.md

## 프로젝트 목적

`cashbook`은 어머니 전용 개인 입출금 장부 웹앱이다.

현재 입출금 내역을 전부 수기로 작성하고 있고, 종합소득세 정산 시 카테고리별/날짜별/입금별/출금별로 직접 계산하고 있다. 이를 웹으로 옮겨, 입출금 내역을 쉽게 입력하고 기간별/카테고리별/입금·출금별 합계와 엑셀 자료를 바로 확인할 수 있게 한다.

## 프로젝트 성격

- 어머니 전용 커스텀 장부 서비스
- 일반 회계 프로그램처럼 복잡하게 만들지 않음
- 입력은 최대한 단순하게 구성
- 조회, 검색, 합계, 엑셀 다운로드가 핵심
- Vercel + Supabase 기반으로 비용 절감
- 추후 유지보수와 수정이 쉬운 구조 지향

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Drizzle ORM
- SheetJS CE (`xlsx`)
- Vercel

## MVP 기능 범위

1. 로그인
2. 대시보드
3. 입출금 내역 등록
4. 입출금 내역 목록 조회
5. 입출금 내역 수정
6. 입출금 내역 삭제
7. 날짜/구분/카테고리/검색어 필터
8. 검색 결과 기준 입금 합계, 출금 합계, 차액 표시
9. 카테고리 관리
10. 월별 통계
11. 카테고리별 통계
12. 엑셀 다운로드

## MVP 제외 범위

- 영수증 이미지 첨부
- 거래처명 상세 관리
- 종소세 반영 여부 관리
- 반복 지출 자동 등록
- 엑셀 업로드
- PDF 출력
- 세무사 공유 계정
- 자동 백업
- soft delete
- 멀티 테넌트
- AI 자동 분류

## 권장 디렉토리 구조

```text
src/
  app/
    login/
      page.tsx
    dashboard/
      page.tsx
    transactions/
      page.tsx
      new/
        page.tsx
      [id]/
        edit/
          page.tsx
    categories/
      page.tsx
    reports/
      monthly/
        page.tsx
      category/
        page.tsx
    api/
      export/
        route.ts
      transactions/
        route.ts

  features/
    auth/
      screens/
        LoginScreen.tsx
    dashboard/
      screens/
        DashboardScreen.tsx
      queries/
    transactions/
      screens/
        TransactionListScreen.tsx
        TransactionCreateScreen.tsx
        TransactionEditScreen.tsx
      components/
        TransactionForm.tsx
        TransactionSearchForm.tsx
        TransactionTable.tsx
        TransactionSummary.tsx
      actions/
      queries/
      types/
    categories/
      screens/
        CategoryScreen.tsx
      components/
      actions/
      queries/
      types/
    reports/
      screens/
        MonthlyReportScreen.tsx
        CategoryReportScreen.tsx
      queries/
      types/

  shared/
    components/
      ui/
      layout/
    utils/
    constants/

  db/
    client.ts
    schema.ts
```

## 아키텍처 규칙

- `src/app`은 라우팅 중심으로 얇게 유지한다.
- 기능 단위 코드는 `src/features`에 배치한다.
- 공통 UI, 레이아웃, 유틸은 `src/shared`에 배치한다.
- Drizzle schema와 DB client는 `src/db`에 배치한다.
- 기본은 Server Component를 사용한다.
- 상태, 이벤트, 브라우저 API가 필요한 경우만 Client Component를 사용한다.
- 등록/수정/삭제는 Server Action을 우선한다.
- 엑셀 다운로드는 Route Handler를 사용한다.

## DB 설계

Supabase Auth의 `auth.users`를 기본 사용자로 사용하고 `profiles.id`가 `auth.users.id`를 참조한다. `categories.user_id`와 `transactions.user_id`는 `auth.users`를 직접 참조하지 않고 `profiles.id`를 참조해 로그인 사용자 소유권을 나타낸다. 모든 앱 쿼리는 현재 `user.id` 조건을 강제하며, DB도 소유자 `NOT NULL`, `profiles` 소유자 FK, 거래–카테고리 복합 소유권 FK로 방어한다.

아래는 0002 소유권 무결성 migration 적용 후의 스키마다. 2026-07-14 Production 적용·사후 검증·앱 배포와 로그인 세션 기반 E2E를 완료했다.

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  name text not null,
  created_at timestamptz not null default now()
);
```

### categories

```sql
create table categories (
  id bigserial primary key,
  user_id uuid not null references profiles(id),
  name text not null,
  type text not null check (type in ('INCOME', 'EXPENSE', 'COMMON')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
```

### transactions

```sql
create table transactions (
  id bigserial primary key,
  user_id uuid not null references profiles(id),
  transaction_date date not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  category_id bigint not null references categories(id),
  title text not null,
  amount bigint not null check (amount between 0 and 999999999999),
  memo text,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  foreign key (category_id, user_id) references categories(id, user_id)
);
```

## 기본 카테고리 예시

기본 카테고리는 성공적인 로그인 직후, 해당 `user_id`의 `profiles` 행이 처음 생성되는 트랜잭션에서 한 번만 자동 생성한다. 카테고리·거래 화면의 일반 조회는 기본 데이터를 생성하지 않는다. `(user_id, name, type)` unique index로 반복 실행을 안전하게 처리한다.

입금 카테고리:

- 판매수입
- 계좌이체
- 현금입금
- 환불
- 기타입금

출금 카테고리:

- 재료비
- 택배비
- 임대료
- 인건비
- 광고비
- 식비
- 교통비
- 소모품비
- 통신비
- 세금
- 기타출금

## 인덱스 설계

```sql
create unique index idx_categories_user_name_type_unique
on categories (user_id, name, type);

create unique index idx_categories_id_user_unique
on categories (id, user_id);

create index idx_categories_user_active
on categories (user_id, is_active);

create index idx_transactions_user_date_id_desc
on transactions (user_id, transaction_date desc, id desc);

create index idx_transactions_date
on transactions (transaction_date);

create index idx_transactions_type_date
on transactions (type, transaction_date);

create index idx_transactions_category_date
on transactions (category_id, transaction_date);

create index idx_transactions_date_id_desc
on transactions (transaction_date desc, id desc);
```

초기 MVP에서는 일반 `LIKE`/`ILIKE` 검색으로 시작한다. 검색어 검색이 중요해지고 데이터가 많아지면 `pg_trgm` 인덱스를 추가한다.

## 화면별 요구사항

### 1. 로그인 화면

- 이메일/비밀번호 로그인
- Supabase Auth 사용
- 회원가입 화면은 초기에는 없어도 됨
- 관리자가 Supabase에서 계정을 직접 만들어도 됨

### 2. 대시보드

표시 항목:

- 이번 달 입금 합계
- 이번 달 출금 합계
- 이번 달 차액
- 최근 입출금 내역 5~10건
- 입출금 등록 버튼

### 3. 입출금 등록 화면

입력 항목:

- 날짜
- 구분: 입금 / 출금
- 카테고리
- 내용
- 금액
- 메모
- 결제수단은 선택사항

버튼:

- 저장
- 저장 후 계속 입력

동작:

- 날짜 기본값은 오늘
- 구분 선택에 따라 카테고리 목록 필터링
- 금액은 숫자로 저장하되 화면에서는 콤마 표시
- 저장 후 계속 입력 시 현재 페이지 유지 및 폼 초기화
- 저장 시 `transactions` 테이블에 insert

### 4. 입출금 목록 화면

검색 조건:

- 시작일
- 종료일
- 구분: 전체 / 입금 / 출금
- 카테고리
- 검색어: 내용 또는 메모 기준
- 검색 버튼
- 초기화 버튼
- 엑셀 다운로드 버튼

목록 컬럼:

- 날짜
- 구분
- 카테고리
- 내용
- 금액
- 메모
- 관리: 수정 / 삭제

상단 요약:

- 검색 결과 입금 합계
- 검색 결과 출금 합계
- 검색 결과 차액

정렬:

- `transaction_date desc`
- `id desc`
- 첫 화면은 20건을 서버에서 렌더링하고, 아래로 스크롤하면 `(transaction_date, id)` 복합 커서로 20건씩 추가 조회한다.
- 후속 페이지는 `/api/transactions`에서 동일한 인증·소유권·검색 조건을 적용해 응답한다.

### 5. 입출금 수정 화면

- 등록 화면과 동일한 폼 사용
- 기존 데이터 표시
- 수정 저장 시 `updated_at` 갱신

### 6. 삭제 기능

- 실수 방지를 위해 `confirm` 사용
- MVP에서는 hard delete 가능
- 추후 필요하면 `deleted_at` 컬럼을 추가하여 soft delete 가능

### 7. 카테고리 관리 화면

기능:

- 카테고리 목록
- 카테고리 추가
- 카테고리 수정
- 사용 여부 변경
- 정렬 순서 관리

이미 거래 내역에 사용된 카테고리는 삭제하지 말고 `is_active=false` 처리하는 방식이 좋다.

### 8. 월별 통계 화면

- 연도 선택
- 월별 입금 합계
- 월별 출금 합계
- 월별 차액

### 9. 카테고리별 통계 화면

- 기간 선택
- 구분 선택
- 카테고리별 합계

### 10. 엑셀 다운로드

대상:

- 현재 검색 조건에 맞는 `transactions` 목록

엑셀 컬럼:

- 날짜
- 구분
- 카테고리
- 내용
- 금액
- 메모
- 등록일

파일명 예시:

```text
cashbook_2026-01-01_2026-12-31.xlsx
```

중요 조건:

- 종소세 정산용으로 사람이 보기 쉬운 컬럼명을 사용한다.
- 금액 컬럼은 숫자 타입으로 저장되게 한다.
- 시작일과 종료일을 모두 필수로 받는다.
- 시작일과 종료일을 모두 포함한 최대 1년 범위만 허용한다. 예를 들어 `2026-01-01`의 최대 종료일은 `2026-12-31`이다.
- Vercel 서버리스 환경에서 로컬 디스크에 저장하지 않는다.
- Route Handler에서 메모리로 생성 후 바로 응답한다.

## 서버 액션 또는 API 설계

transactions 관련:

- `createTransaction`
- `updateTransaction`
- `deleteTransaction`
- `getTransactions`
- `getTransactionPage`
- `getTransactionById`
- `getTransactionSummary`
- `GET /api/transactions`

categories 관련:

- `createCategory`
- `updateCategory`
- `toggleCategoryActive`
- `getCategories`
- `getActiveCategories`

reports 관련:

- `getMonthlyReport`
- `getCategoryReport`

## 검색 조건 타입

```ts
type TransactionSearchCondition = {
  startDate?: string;
  endDate?: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: number;
  keyword?: string;
  validationError?: string;
};
```

## 검색 결과 타입

```ts
type TransactionCursor = {
  transactionDate: string;
  id: number;
};

type TransactionSearchResult = {
  transactions: TransactionRow[];
  nextCursor: TransactionCursor | null;
  totalCount: number;
  totalIncome: bigint;
  totalExpense: bigint;
  balance: bigint;
};
```

## 검색/합계 규칙

- 목록과 합계는 반드시 같은 검색 조건을 사용한다.
- 합계는 프론트 현재 페이지 데이터만 더하지 않고 DB 기준으로 계산하며 `bigint` 정밀도를 유지한다.
- 기본 정렬은 `transaction_date desc`, `id desc`이다.
- 페이지 크기는 20건이며 offset이 아닌 `(transaction_date, id)` 커서를 사용한다.
- 초기 검색은 `title` 또는 `memo`에 대한 `ILIKE`로 시작하며 `%`, `_`, escape 문자는 사용자 입력 그대로 검색한다.

## UX 기준

- 화면은 매우 단순해야 한다.
- 버튼은 큼직하게 만든다.
- 입력 항목은 최소화한다.
- 금액은 항상 콤마 표시한다.
- 날짜 입력 기본값은 오늘 날짜로 설정한다.
- 모바일에서도 보기 편해야 한다.
- 데스크탑 테이블은 읽기 쉽게 구성한다.
- 모바일에서는 카드형 또는 가로 스크롤을 허용한다.
- 복잡한 애니메이션은 필요 없다.

## 보안 기준

- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트에 노출 금지
- `DATABASE_URL`은 클라이언트에 노출 금지
- 브라우저 노출 가능 키와 서버 전용 키를 구분
- DB를 사용하는 로컬·Vercel Preview·Production은 `SUPABASE_DB_CA_CERT`에 저장한 해당 Supabase Server root certificate로 서버 인증서와 호스트를 검증
- DB 인증서 값을 Git, 문서, 로그에 기록 금지
- 인증되지 않은 사용자는 로그인 화면으로 redirect
- 모든 장부 페이지는 로그인 필요
- 초기에는 사용자 1~2명만 쓰는 구조로 단순하게 구현
- `transactions.user_id`, `categories.user_id`와 모든 CRUD/조회 조건으로 로그인 사용자별 데이터를 분리

## 비용 절감 배포 기준

- Vercel Hobby 플랜 사용
- Supabase Free 플랜 사용
- 별도 EC2, RDS, ALB, Redis, S3 사용하지 않음
- 영수증 첨부 기능은 추후 Supabase Storage로 확장
- 초기에는 파일 업로드 기능 없이 장부 데이터와 엑셀 다운로드만 구현
