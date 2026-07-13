# Deployment

## 현재 Production

- Vercel 프로젝트: `joe-private/cashbook`
- Production URL: [https://cashbook-iota-neon.vercel.app](https://cashbook-iota-neon.vercel.app)
- 최초 Production 배포 확인일: 2026-07-13
- 배포 기준 브랜치와 커밋: `main` / `a94ebff`

로컬 프로젝트는 `.vercel/project.json`으로 Vercel 프로젝트에 연결된다. `.vercel`과 `.env.local`은 Git에 포함하지 않는다.

Vercel GitHub 앱의 저장소 접근 권한은 아직 연결되지 않았다. 자동 배포를 설정하기 전까지는 아래 CLI 명령으로 Production을 배포한다.

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
- `/login`: 미인증 요청 `200 OK`
- `/dashboard`, `/transactions`: 미인증 요청 `/login`으로 `307` 리디렉션
- `/api/export`: 미인증 요청 `/login`으로 `307` 리디렉션
- Production Supabase 스키마에서 `categories.user_id`, `transactions.user_id` UUID 확인
- Production Supabase 스키마에서 `transactions.amount` bigint 확인

로그인 후 등록, 검색, 통계, 엑셀 다운로드 E2E는 Phase 10에서 점검한다.
