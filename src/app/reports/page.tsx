import Link from "next/link";
import { requireUser } from "@/features/auth/queries/require-user";

export default async function ReportsPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header>
          <p className="text-base font-semibold text-zinc-500">cashbook</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-950">통계</h1>
        </header>

        <Link
          href="/reports/monthly"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:bg-zinc-50"
        >
          <h2 className="text-2xl font-bold text-zinc-950">월별 통계</h2>
          <p className="mt-2 text-base text-zinc-600">연도별 월별 입금, 출금, 차액을 봅니다.</p>
        </Link>

        <Link
          href="/reports/category"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:bg-zinc-50"
        >
          <h2 className="text-2xl font-bold text-zinc-950">카테고리별 통계</h2>
          <p className="mt-2 text-base text-zinc-600">기간과 구분별 카테고리 합계를 봅니다.</p>
        </Link>
      </section>
    </main>
  );
}
