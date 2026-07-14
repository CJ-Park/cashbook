# PWA 설치 지원 설계

- 상태: Production 배포·설치 조건 검증 완료, Android·iOS 실제 기기 검증 전
- 작성일: 2026-07-14
- 대상: `cashbook` Post-MVP PWA 설치 지원

## 1. 목표

- Android, iPhone/iPad, 데스크톱의 지원 브라우저에서 `살림장부`를 앱처럼 설치할 수 있게 한다.
- 설치 후 브라우저 주소창이 없는 `standalone` 화면으로 실행한다.
- 기존 Supabase Auth, Server Component, Server Action 동작을 그대로 유지한다.
- 사용자 제공 `cashbook_fav.png`를 홈 화면 앱 아이콘으로 사용한다.

## 2. 1차 범위에서 제외하는 것

- 장부 데이터의 오프라인 조회·등록·수정
- 서비스 워커와 런타임 캐시
- 푸시 알림, 백그라운드 동기화
- 앱스토어·플레이스토어 등록
- 사용자 정의 `beforeinstallprompt` 설치 버튼

현재 설치 요건은 유효한 Web App Manifest와 HTTPS로 충족할 수 있다. 이 앱은 금액과 거래 내역을 다루므로, 설치 기능만을 위해 인증 응답을 가로채는 서비스 워커를 먼저 추가하지 않는다.

## 3. 현재 상태와 전제

- Production은 `https://cashbook-iota-neon.vercel.app`에서 HTTPS로 제공된다.
- Next.js `16.2.10` App Router를 사용한다.
- Web App Manifest와 일반·maskable·Apple용 PWA 아이콘을 구성했으며, 서비스 워커는 사용하지 않는다.
- `/dashboard`는 미인증 사용자를 `/login?next=/dashboard`로 보낸다.
- 모바일 앱 셸과 로그인 화면은 상하좌우 safe area를 반영한다.
- `proxy` matcher는 `/manifest.webmanifest`와 PNG 아이콘을 인증 처리에서 제외한다.

## 4. 핵심 설계 결정

### 설치 방식

- Next.js Metadata File Convention의 `src/app/manifest.ts`를 사용한다.
- 별도 PWA 라이브러리나 신규 런타임 의존성은 추가하지 않는다.
- Android와 데스크톱 Chromium에서는 브라우저 기본 설치 UI를 사용한다.
- iOS/iPadOS에서는 공유 메뉴의 `홈 화면에 추가`에서 `웹 앱으로 열기(Open as Web App)`를 켜는 절차를 사용한다.
- 설치 안내 UI가 실제 사용자에게 필요하면 기본 설치 검증 후 별도 소규모 작업으로 추가한다.

### 시작 경로와 인증

- `id`: `/`
- `scope`: `/`
- `start_url`: `/dashboard`
- `display`: `standalone`

로그인 상태에서는 대시보드로 바로 시작하고, 세션이 없거나 만료되면 기존 인증 보호 로직이 로그인 화면으로 보낸다. 설치 식별자인 `id`는 배포 후 변경하지 않는다.

### Manifest 초안

| 필드 | 값 |
| --- | --- |
| `name` | `살림장부` |
| `short_name` | `살림장부` |
| `description` | `입금과 출금을 쉽고 편하게 기록하는 우리 가족 장부` |
| `id` | `/` |
| `start_url` | `/dashboard` |
| `scope` | `/` |
| `display` | `standalone` |
| `lang` | `ko-KR` |
| `background_color` | `#f4f7f9` |
| `theme_color` | `#f4f7f9` |

화면 방향은 휴대폰과 태블릿을 모두 지원하기 위해 고정하지 않는다.

## 5. 앱 아이콘 설계

### 원본

- 사용자 제공 파일: `cashbook_fav.png`
- 확인 결과: 1254×1254, 정사각형, 불투명 PNG
- 중앙 그림과 글자는 Android 마스커블 아이콘의 핵심 안전영역 안에 들어오는지 실제 렌더링으로 최종 확인한다.
- 원본 그림을 AI로 다시 그리거나 내용을 바꾸지 않는다.

### 파생 파일

| 경로 | 크기 | 용도 |
| --- | ---: | --- |
| `public/icons/cashbook-192.png` | 192×192 | Chromium 설치 필수 아이콘 |
| `public/icons/cashbook-512.png` | 512×512 | 고해상도 일반 설치 아이콘 |
| `public/icons/cashbook-maskable-512.png` | 512×512 | Android adaptive/maskable 아이콘 |
| `src/app/apple-icon.png` | 180×180 | iOS 홈 화면 아이콘 |

일반 아이콘과 Apple 아이콘은 원본을 정사각 비율 그대로 축소한다. 마스커블 아이콘은 중앙 그림을 변경하지 않고 원본 전체를 85%로 중앙 축소한 뒤 원본 모서리색으로 바깥 영역을 채워 핵심 요소가 안전영역 안에 들어오게 한다.

Manifest의 아이콘 선언은 다음 목적을 구분한다.

- `cashbook-192.png`, `cashbook-512.png`: `purpose: "any"`
- `cashbook-maskable-512.png`: `purpose: "maskable"`

## 6. 파일 변경 계획

### 생성

- `src/app/manifest.ts`
- `public/icons/cashbook-192.png`
- `public/icons/cashbook-512.png`
- `public/icons/cashbook-maskable-512.png`
- `src/app/apple-icon.png`

### 수정

- `src/app/layout.tsx`
  - 앱 이름 관련 metadata 보완
  - `viewportFit: "cover"` 적용 여부와 safe area를 함께 반영
- `src/proxy.ts`
  - `/manifest.webmanifest`를 인증 Proxy 대상에서 제외
- `src/shared/components/layout/AppShell.tsx`
  - standalone 환경의 모바일 상단 safe area 보완
- 필요 시 `src/features/auth/screens/LoginScreen.tsx`
  - 노치가 있는 iPhone standalone 화면에서 상·하단 여백 보완
- 구현 완료 후 `README.md`, `DECISIONS.md`, `DEPLOYMENT.md`
  - 설치 지원 범위와 오프라인 미지원 사실 기록

## 7. 서비스 워커와 캐시 정책

### 1차 구현

서비스 워커를 등록하지 않는다. 따라서 모든 장부 기능은 지금처럼 네트워크와 서버 인증을 기준으로 동작하며, 별도 Cache Storage에 거래 내역이 남지 않는다. 일반 웹 배포와 동일하게 다음 탐색이나 새로고침에서 최신 버전을 받는다.

### 향후 오프라인 안내가 필요할 때

서비스 워커는 별도 설계·작업으로 추가하며 다음 경계를 지킨다.

캐시 가능:

- 해시가 붙은 공개 정적 JS/CSS
- 공개 앱 아이콘
- 개인정보가 없는 전용 오프라인 안내 화면

캐시 금지:

- 로그인·로그아웃과 Supabase Auth 요청
- `/dashboard`, `/transactions`, `/categories`, `/reports`의 HTML/RSC 응답
- Server Action과 모든 `POST` 요청
- `/api/export` 응답
- 금액, 합계, 거래 내역, 사용자 정보가 포함된 모든 응답

서비스 워커를 추가하는 경우 `/sw.js`는 Proxy에서 제외하고 `Cache-Control: no-cache, no-store, must-revalidate`와 동일 출처 CSP를 적용한다. 등록 화면 입력 중 강제 새로고침도 허용하지 않는다.

## 8. 설치 UX

- Chromium: 주소창 또는 브라우저 메뉴의 기본 `앱 설치` UI를 우선한다.
- iOS/iPadOS: Safari의 `공유` → `홈 화면에 추가` → `웹 앱으로 열기(Open as Web App)`를 켜서 설치한다.
- 설치된 상태에서는 앱이 `standalone`으로 열려야 한다.
- 사용자 정의 설치 버튼은 플랫폼마다 동작이 달라 1차 범위에서 제외한다.
- 실제 사용자에게 설치 과정이 어렵다면 로그인 화면에 간단한 플랫폼별 안내를 추가하되, 이미 standalone으로 실행 중일 때는 숨긴다.

## 9. 검증 기준

### 자동·개발 검증

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `/manifest.webmanifest`가 `200`과 올바른 manifest Content-Type으로 응답
- 모든 아이콘 URL이 `200`으로 응답
- manifest가 Proxy 인증 처리 없이 제공됨
- Production Chrome 자동화에서 비공개 컨텍스트 고유의 `in-incognito`를 제외한 설치 차단 오류가 0건
- 일반 192·512, maskable 512, Apple 180 아이콘의 응답·MIME·실제 픽셀 크기가 선언과 일치
- 서비스 워커 등록과 Cache Storage key가 0개

### 브라우저·기기 검증

- Chrome DevTools Application의 Manifest에 오류가 없음
- 192·512 일반 아이콘과 마스커블 안전영역이 정상
- Android Chrome에서 설치 후 올바른 이름·아이콘으로 standalone 실행
- iPhone/iPad에서 홈 화면 추가 후 올바른 이름·아이콘으로 standalone 실행
- 데스크톱 Chrome/Edge에서 설치 가능
- 로그인 상태로 실행하면 `/dashboard` 표시
- 로그아웃 또는 세션 만료 상태로 실행하면 `/login` 표시
- standalone 화면에서 상단 노치와 하단 홈 인디케이터가 UI를 가리지 않음
- 등록·수정·삭제·검색·통계·엑셀 다운로드가 설치 전과 동일하게 동작
- 오프라인 상태에서 이전 장부 화면이나 금액이 별도 PWA 캐시로 노출되지 않음

### Production 검증

- Vercel Production 배포 후 실제 도메인에서 manifest와 아이콘 확인
- 웹 컨텍스트의 세션 만료 redirect와 로그아웃 보호 흐름 확인
- 실제 설치 후 아이콘·standalone 재실행과 설치 앱 내부 세션 흐름은 Android·iOS 실기기에서 추가 확인
- 문제가 생기면 manifest 연결과 아이콘 metadata만 되돌릴 수 있어야 함

## 10. 구현 순서

1. 첨부 원본에서 아이콘 파생 파일 생성 및 마스커블 안전영역 확인
2. `manifest.ts` 추가
3. layout metadata, Proxy 제외 규칙, standalone safe area 반영
4. lint, typecheck, build와 로컬 브라우저 검증
5. Production 배포
6. Android·iOS 실제 설치 검증
7. 검증 결과와 오프라인 미지원 범위를 문서에 반영

## 11. 참고 자료

- [Next.js PWA 가이드](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Next.js manifest 파일 규약](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)
- [Next.js icon/apple-icon 파일 규약](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [web.dev: Web app manifest](https://web.dev/learn/pwa/web-app-manifest)
