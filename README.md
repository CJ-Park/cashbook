# cashbook

어머니 전용 개인 입출금 장부 웹앱입니다.

현재 수기로 작성 중인 입출금 내역을 웹으로 옮겨, 입금/출금 등록, 검색, 합계 확인, 월별/카테고리별 통계, 종합소득세 정산용 엑셀 다운로드를 쉽게 할 수 있도록 만드는 것이 목표입니다.

## 목적

- 수기 장부 작성 부담 줄이기
- 날짜별, 카테고리별, 입금/출금별 합계 계산 자동화
- 종합소득세 정산에 필요한 엑셀 자료를 빠르게 만들기
- 일반 회계 프로그램보다 단순하고 사용하기 쉬운 전용 장부 만들기

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Drizzle ORM
- Vercel
- SheetJS CE (`xlsx`)

## 주요 기능

- 이메일/비밀번호 로그인
- 대시보드
- 입출금 내역 등록, 조회, 수정, 삭제
- 날짜, 구분, 카테고리, 검색어 필터
- 검색 결과 기준 입금 합계, 출금 합계, 차액 표시
- 카테고리 관리
- 월별 통계
- 카테고리별 통계
- 엑셀 다운로드
- PWA 앱 설치 지원

## MVP 범위

MVP에서는 핵심 장부 기능만 구현합니다.

- 로그인
- 입출금 CRUD
- 검색과 합계
- 카테고리 관리
- 월별/카테고리별 통계
- 엑셀 다운로드

다음 기능은 MVP 이후 확장 후보로만 기록합니다.

- 영수증 이미지 첨부
- 엑셀 업로드
- PDF 출력
- 세무사 공유 계정
- 자동 백업
- 반복 지출 자동 등록
- AI 자동 분류
- 멀티 테넌트
- 거래처명 상세 관리
- 종합소득세 반영 여부 관리
- soft delete

## 로컬 실행

```bash
npm install
npm run db:migrate
npm run dev
npm run lint
npm run typecheck
npm run build
```

1. `.env.example`을 기준으로 `.env.local`을 준비합니다.
2. `npm run db:migrate`로 Drizzle migration을 적용합니다.
3. Supabase Authentication에서 이메일/비밀번호 사용자를 준비합니다.
4. 로그인 사용자가 카테고리 또는 거래 화면을 처음 열면 사용자 전용 기본 카테고리가 자동 생성됩니다.

수동 seed 명령은 사용하지 않습니다. 카테고리와 거래는 로그인 계정의 `user.id`로 분리됩니다.

입출금 목록에서 현재 날짜, 구분, 카테고리, 검색어 조건을 유지한 채 엑셀 파일을 내려받을 수 있습니다. 엑셀은 서버 메모리에서 생성되며 로컬 디스크에 저장하지 않습니다.

## 환경변수

필요한 환경변수 이름은 `.env.example`을 참고합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (현재 미사용, 관리자 권한 기능 추가 시에만 등록)

서버 전용 키는 클라이언트에 노출하지 않습니다.

## Production 배포

- Vercel 프로젝트: `joe-private/cashbook`
- Production URL: [https://cashbook-iota-neon.vercel.app](https://cashbook-iota-neon.vercel.app)
- Production 필수 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
- 배포 및 검증 절차: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 앱 설치

Production 웹페이지는 PWA 방식으로 휴대폰과 데스크톱에 설치할 수 있습니다.

- Android Chrome·데스크톱 Chrome/Edge: 브라우저의 `앱 설치` 메뉴 사용
- iPhone/iPad: 브라우저의 `공유` → `홈 화면에 추가` 사용
- 설치 후 `살림장부` 아이콘을 누르면 독립 앱 화면으로 실행

현재 PWA는 온라인 전용입니다. 거래 내역과 금액이 기기의 PWA 캐시에 남지 않도록 서비스 워커와 오프라인 장부 기능은 사용하지 않습니다. 자세한 설계는 [PWA_DESIGN.md](./PWA_DESIGN.md)를 참고합니다.

## 배포 방향

- Vercel Hobby 플랜 사용
- Supabase Free 플랜 사용
- 초기 MVP에서는 EC2, RDS, ALB, Redis, S3를 사용하지 않음
- 파일 업로드 기능은 제외
- 영수증 첨부가 필요해지면 Supabase Storage 확장 검토

## 브랜치 전략

MVP에서는 복잡한 Git Flow를 사용하지 않습니다.

- `main`: 항상 실행 가능하고 배포 가능한 상태
- 기능 작업: 짧은 `feature/*` 브랜치 사용
- 문서 작업: `feature/docs-init`
- 프로젝트 초기 세팅: `feature/project-setup`
