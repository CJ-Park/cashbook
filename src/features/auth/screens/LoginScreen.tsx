import { SubmitButton } from "@/shared/components/ui/SubmitButton";
import { login } from "../actions/login";

const errorMessages: Record<string, string> = {
  missing: "이메일과 비밀번호를 모두 입력해주세요.",
  invalid: "이메일 또는 비밀번호가 올바르지 않습니다.",
};

type LoginScreenProps = {
  error?: string;
  nextPath?: string;
};

export function LoginScreen({ error, nextPath = "/dashboard" }: LoginScreenProps) {
  const errorMessage = error
    ? (errorMessages[error] ?? "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    : undefined;

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 size-80 rounded-full bg-[var(--primary-soft)] blur-3xl sm:size-[28rem]"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-32 size-80 rounded-full bg-[var(--income-soft)] blur-3xl sm:size-[30rem]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <section aria-labelledby="login-intro-title" className="mx-auto w-full max-w-xl lg:mx-0">
          <div className="inline-flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-[0_10px_24px_rgb(29_77_107_/_0.22)]"
            >
              원
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-black tracking-[0.16em] text-[var(--text-faint)]">
                CASHBOOK
              </span>
              <span className="block text-xl font-black tracking-[-0.03em] text-[var(--text)]">
                살림장부
              </span>
            </span>
          </div>

          <h1
            id="login-intro-title"
            className="mt-8 text-[2.35rem] leading-[1.16] font-black tracking-[-0.055em] text-[var(--text)] sm:text-[3.25rem]"
          >
            오늘의 입출금,
            <span className="block text-[var(--primary)]">간단하게 기록하세요.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[var(--text-soft)]">
            필요한 내역만 빠르게 입력하고, 이번 달 흐름과 카테고리별 합계를 한눈에 확인할 수
            있습니다.
          </p>

          <ul className="mt-7 hidden grid-cols-3 gap-3 sm:grid" aria-label="장부 주요 기능">
            {[
              ["빠른 입력", "날짜와 금액을 간편하게"],
              ["쉬운 확인", "입금·출금 합계를 한눈에"],
              ["안전한 장부", "로그인한 계정만 접근"],
            ].map(([title, description]) => (
              <li key={title} className="surface-card p-4">
                <p className="font-extrabold text-[var(--text)]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="login-form-title"
          className="surface-card mx-auto w-full max-w-lg p-6 sm:p-8 lg:mx-0 lg:justify-self-end"
        >
          <div>
            <p className="text-sm font-black tracking-[0.12em] text-[var(--primary)] uppercase">
              Welcome back
            </p>
            <h2
              id="login-form-title"
              className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--text)]"
            >
              장부 로그인
            </h2>
            <p id="login-help" className="mt-2 text-base leading-7 text-[var(--text-soft)]">
              등록된 이메일과 비밀번호를 입력해주세요.
            </p>
          </div>

          <form action={login} className="mt-7 space-y-5" aria-describedby="login-help">
            <input type="hidden" name="next" value={nextPath} />

            {errorMessage ? (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="rounded-2xl border border-[#efc9c4] bg-[var(--danger-soft)] px-4 py-3.5 text-base font-bold text-[var(--danger)]"
              >
                {errorMessage}
              </div>
            ) : null}

            <label className="block">
              <span className="field-label">이메일</span>
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                autoFocus
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? "login-error" : undefined}
                placeholder="example@email.com"
                className="field-control"
              />
            </label>

            <label className="block">
              <span className="field-label">비밀번호</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={errorMessage ? "login-error" : undefined}
                placeholder="비밀번호를 입력하세요"
                className="field-control"
              />
            </label>

            <SubmitButton
              pendingLabel="로그인 중..."
              className="button-primary min-h-14 w-full text-lg"
            >
              로그인
            </SubmitButton>
          </form>

          <p className="mt-6 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-center text-sm leading-6 text-[var(--text-soft)]">
            가족 전용 장부입니다. 등록된 계정으로만 이용할 수 있어요.
          </p>
        </section>
      </div>
    </main>
  );
}
