# TASKS.md

MVP는 Phase 단위로 작게 진행한다. Codex 작업도 한 번에 큰 범위를 맡기지 말고, 아래 Phase 또는 하위 체크리스트 단위로 진행한다.

## Phase 0. Documentation

- [x] `AGENTS.md` 생성
- [x] `README.md` 생성
- [x] `PROJECT_SPEC.md` 생성
- [x] `TASKS.md` 생성
- [x] `DECISIONS.md` 생성
- [x] `.env.example` 생성
- [ ] 문서 검토 및 보완

## Phase 1. Project Setup

- [x] `feature/project-setup` 브랜치 생성
- [x] Next.js App Router + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정
- [x] 기본 실행 확인
- [x] 기본 디렉토리 구조 생성
- [x] `npm run lint` 확인
- [x] `npm run build` 확인

## Phase 2. Database

- [x] Supabase 프로젝트 생성
- [x] 환경변수 설정
- [x] Drizzle ORM 설정
- [x] DB client 작성
- [x] `profiles` schema 작성
- [x] `categories` schema 작성
- [x] `transactions` schema 작성
- [x] 인덱스 정의
- [x] migration 생성
- [x] migration 적용
- [x] 기본 카테고리 seed 작성

## Phase 3. Auth

- [x] Supabase Auth 설정
- [x] 로그인 화면 구현
- [x] 이메일/비밀번호 로그인 구현
- [x] 로그아웃 구현
- [x] 인증 상태 확인 유틸 작성
- [x] 인증 보호 라우팅 구현
- [x] 인증되지 않은 사용자를 로그인 화면으로 redirect

## Phase 4. Dashboard

- [x] 대시보드 라우트 생성
- [x] 이번 달 입금 합계 표시
- [x] 이번 달 출금 합계 표시
- [x] 이번 달 차액 표시
- [x] 최근 입출금 내역 5~10건 표시
- [x] 입출금 등록 버튼 추가
- [x] 모바일 화면 확인

## Phase 5. Transactions

- [x] 입출금 등록 화면 구현
- [x] 날짜 기본값 오늘로 설정
- [x] 구분 선택에 따른 카테고리 필터링
- [x] 금액 콤마 표시 유틸 적용
- [x] `저장` 동작 구현
- [x] `저장 후 계속 입력` 동작 구현
- [x] 입출금 목록 화면 구현
- [x] 시작일/종료일 필터 구현
- [x] 구분 필터 구현
- [x] 카테고리 필터 구현
- [x] 검색어 필터 구현
- [x] 검색 결과 입금 합계 표시
- [x] 검색 결과 출금 합계 표시
- [x] 검색 결과 차액 표시
- [x] 목록 정렬 `transaction_date desc`, `id desc` 적용
- [x] 입출금 수정 화면 구현
- [x] 수정 저장 시 `updated_at` 갱신
- [x] 삭제 confirm 구현
- [x] MVP hard delete 구현

## Phase 6. Categories

- [x] 카테고리 목록 구현
- [x] 카테고리 추가 구현
- [x] 카테고리 수정 구현
- [x] 카테고리 사용 여부 변경 구현
- [x] 정렬 순서 관리 구현
- [x] 거래 내역에 사용된 카테고리는 비활성 처리
- [x] 기본 카테고리 표시 확인

## Phase 7. Reports

- [x] 월별 통계 화면 구현
- [x] 연도 선택 구현
- [x] 월별 입금 합계 표시
- [x] 월별 출금 합계 표시
- [x] 월별 차액 표시
- [x] 카테고리별 통계 화면 구현
- [x] 기간 선택 구현
- [x] 구분 선택 구현
- [x] 카테고리별 합계 표시

## Phase 8. Excel Export

- [ ] Route Handler 생성
- [ ] 현재 검색 조건 전달 방식 정의
- [ ] 검색 조건에 맞는 transactions 조회
- [ ] 엑셀 컬럼 정의
- [ ] 금액 컬럼 숫자 타입 유지
- [ ] 파일명 규칙 적용
- [ ] 로컬 디스크 저장 없이 메모리에서 응답
- [ ] 종소세 정산용 가독성 확인

## Phase 9. Deployment

- [ ] Vercel 프로젝트 연결
- [ ] Supabase 환경변수 설정
- [ ] Vercel 환경변수 설정
- [ ] production build 확인
- [ ] 배포 후 로그인 확인
- [ ] 배포 후 CRUD 확인
- [ ] 배포 후 엑셀 다운로드 확인

## Phase 10. MVP Review

- [ ] 핵심 기능 전체 흐름 점검
- [ ] 모바일 사용성 점검
- [ ] 버튼 크기와 입력 편의성 점검
- [ ] 검색 조건과 합계 일치 여부 점검
- [ ] 엑셀 다운로드 결과 점검
- [ ] 보안 환경변수 노출 여부 점검
- [ ] 문서 최신화
- [ ] MVP 이후 확장 후보 정리
