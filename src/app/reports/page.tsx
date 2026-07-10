import Link from "next/link";
import { requireUser } from "@/features/auth/queries/require-user";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";

const reports = [
  {
    href: "/reports/monthly",
    marker: "12",
    eyebrow: "월별 흐름",
    title: "월별 통계",
    description: "선택한 연도의 월별 입금, 출금, 차액을 한눈에 비교합니다.",
    helper: "한 해의 흐름이 궁금할 때",
    accentClass: "bg-[var(--primary)]",
    markerClass: "bg-[var(--primary)] text-white",
    softClass: "bg-[var(--primary-soft)]",
  },
  {
    href: "/reports/category",
    marker: "분",
    eyebrow: "항목별 합계",
    title: "카테고리별 통계",
    description: "기간과 입출금 구분을 골라 카테고리별 사용 금액을 확인합니다.",
    helper: "어디에 많이 쓰였는지 궁금할 때",
    accentClass: "bg-[var(--income)]",
    markerClass: "bg-[var(--income)] text-white",
    softClass: "bg-[var(--income-soft)]",
  },
] as const;

export default async function ReportsPage() {
  await requireUser();

  return (
    <AppShell activeSection="reports">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
        <PageHeader
          eyebrow="REPORT"
          title="통계 보기"
          description="장부에 쌓인 내역을 월별 또는 카테고리별로 편하게 살펴보세요."
        />

        <section aria-labelledby="report-menu-title">
          <div className="mb-5">
            <h2 id="report-menu-title" className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">
              어떤 통계를 볼까요?
            </h2>
            <p className="mt-1 text-sm text-[var(--text-soft)]">원하는 보고서를 누르면 바로 조회할 수 있습니다.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {reports.map((report) => (
              <Link
                key={report.href}
                href={report.href}
                className="surface-card group relative flex min-h-72 flex-col overflow-hidden p-6 transition hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] sm:p-8"
              >
                <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${report.accentClass}`} />
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex size-14 items-center justify-center rounded-[1.1rem] text-lg font-black shadow-sm ${report.markerClass}`}
                  >
                    {report.marker}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex size-11 items-center justify-center rounded-full text-xl font-black text-[var(--primary)] transition group-hover:translate-x-1 ${report.softClass}`}
                  >
                    →
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-black tracking-[0.1em] text-[var(--primary)] uppercase">
                    {report.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[var(--text)] sm:text-[1.75rem]">
                    {report.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">{report.description}</p>
                </div>

                <p className={`mt-auto inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-extrabold text-[var(--text-soft)] ${report.softClass}`}>
                  {report.helper}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <aside className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-black text-[var(--text)]">더 자세한 내역이 필요하신가요?</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              입출금 내역 화면에서는 날짜, 구분, 카테고리를 함께 검색할 수 있어요.
            </p>
          </div>
          <Link href="/transactions" className="button-secondary min-h-12 shrink-0">
            입출금 내역 보기
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
