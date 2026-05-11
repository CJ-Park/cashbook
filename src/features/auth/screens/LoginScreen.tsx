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
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-3 text-lg font-semibold text-zinc-600">cashbook</p>
          <h1 className="text-3xl font-bold text-zinc-950">장부 로그인</h1>
          <p className="mt-3 text-lg leading-8 text-zinc-600">
            등록된 이메일과 비밀번호로 로그인해주세요.
          </p>
        </div>

        <form action={login} className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-zinc-800">이메일</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="min-h-14 w-full rounded-md border border-zinc-300 px-4 text-lg text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-zinc-800">비밀번호</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-14 w-full rounded-md border border-zinc-300 px-4 text-lg text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-base font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="min-h-14 w-full rounded-md bg-zinc-900 px-5 text-lg font-bold text-white shadow-sm hover:bg-zinc-800"
          >
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
