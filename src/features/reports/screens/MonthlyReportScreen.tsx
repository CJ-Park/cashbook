import Link from "next/link";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SummaryCard } from "@/shared/components/ui/SummaryCard";
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/format";
import type { MonthlyReportRow } from "../types";

type MonthlyReportScreenProps = {
  year: number;
  rows: MonthlyReportRow[];
};

export function MonthlyReportScreen({ year, rows }: MonthlyReportScreenProps) {
  const zeroAmount = BigInt(0);
  const hasData = rows.some(
    (row) => row.totalIncome > zeroAmount || row.totalExpense > zeroAmount,
  );
  const annualTotal = rows.reduce(
    (total, row) => ({
      income: total.income + row.totalIncome,
      expense: total.expense + row.totalExpense,
    }),
    { income: zeroAmount, expense: zeroAmount },
  );
  const annualBalance = annualTotal.income - annualTotal.expense;

  return (
    <AppShell activeSection="reports">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
        <PageHeader
          backHref="/reports"
          backLabel="통계 목록"
          title="월별 통계"
          description={`${year}년의 입금과 출금 흐름을 월별로 비교합니다.`}
          action={
            <Link href="/reports/category" className="button-secondary min-h-12">
              카테고리별 통계
            </Link>
          }
        />

        <section aria-label={`${year}년 합계`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="sm:col-span-2 xl:col-span-1">
            <SummaryCard
              label={`${year}년 차액`}
              value={formatCurrency(annualBalance)}
              tone={annualBalance < zeroAmount ? "expense" : "balance"}
              hint={hasData ? "입금에서 출금을 뺀 금액" : "아직 등록된 내역이 없어요"}
              featured
            />
          </div>
          <SummaryCard
            label={`${year}년 입금 합계`}
            value={formatCurrency(annualTotal.income)}
            tone="income"
            hint="12개월 입금 합계"
          />
          <SummaryCard
            label={`${year}년 출금 합계`}
            value={formatCurrency(annualTotal.expense)}
            tone="expense"
            hint="12개월 출금 합계"
          />
        </section>

        <section aria-labelledby="year-filter-title" className="surface-card p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <h2 id="year-filter-title" className="text-lg font-black tracking-[-0.02em] text-[var(--text)]">
              조회 연도
            </h2>
            <p className="text-sm text-[var(--text-soft)]">화살표를 누르거나 연도를 직접 입력할 수 있어요.</p>
          </div>

          <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            {year > MIN_SUPPORTED_YEAR ? (
              <Link
                href={`/reports/monthly?year=${year - 1}`}
                aria-label={`${year - 1}년 보기`}
                className="button-secondary min-h-13 w-full shrink-0 sm:w-auto"
              >
                ← {year - 1}년
              </Link>
            ) : (
              <span aria-disabled="true" className="button-secondary min-h-13 w-full shrink-0 opacity-50 sm:w-auto">
                이전 연도
              </span>
            )}

            <label className="block w-full sm:max-w-52">
              <span className="field-label">연도</span>
              <input
                name="year"
                type="number"
                inputMode="numeric"
                min={MIN_SUPPORTED_YEAR}
                max={MAX_SUPPORTED_YEAR}
                defaultValue={year}
                className="field-control money text-center font-extrabold"
              />
            </label>

            <button type="submit" className="button-primary min-h-13 w-full shrink-0 sm:w-auto">
              조회하기
            </button>

            {year < MAX_SUPPORTED_YEAR ? (
              <Link
                href={`/reports/monthly?year=${year + 1}`}
                aria-label={`${year + 1}년 보기`}
                className="button-secondary min-h-13 w-full shrink-0 sm:w-auto"
              >
                {year + 1}년 →
              </Link>
            ) : (
              <span aria-disabled="true" className="button-secondary min-h-13 w-full shrink-0 opacity-50 sm:w-auto">
                다음 연도
              </span>
            )}
          </form>
        </section>

        {!hasData ? (
          <section className="surface-card border-dashed p-7 text-center sm:p-9" aria-live="polite">
            <span
              aria-hidden="true"
              className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-xl font-black text-[var(--text-soft)]"
            >
              0
            </span>
            <h2 className="mt-4 text-lg font-black text-[var(--text)]">{year}년 내역이 아직 없습니다.</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              다른 연도를 조회하거나 새 입출금 내역을 등록해보세요.
            </p>
          </section>
        ) : null}

        <section aria-labelledby="monthly-detail-title" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="monthly-detail-title" className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">
                월별 상세
              </h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">1월부터 12월까지의 합계입니다.</p>
            </div>
            <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-extrabold text-[var(--text-soft)]">
              12개월
            </span>
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map((row) => {
              const isEmptyMonth =
                row.totalIncome === zeroAmount && row.totalExpense === zeroAmount;

              return (
                <article key={row.month} className="surface-card p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                    <h3 className="text-xl font-black text-[var(--text)]">{row.month}월</h3>
                    {isEmptyMonth ? (
                      <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--text-faint)]">
                        내역 없음
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-bold text-[var(--text-soft)]">입금</dt>
                      <dd className="money mt-1 break-words text-base font-black text-[var(--income)]">
                        {formatCurrency(row.totalIncome)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-bold text-[var(--text-soft)]">출금</dt>
                      <dd className="money mt-1 break-words text-base font-black text-[var(--expense)]">
                        {formatCurrency(row.totalExpense)}
                      </dd>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
                      <dt className="text-sm font-bold text-[var(--text-soft)]">차액</dt>
                      <dd
                        className={`money mt-1 break-words text-lg font-black ${
                          row.balance < zeroAmount
                            ? "text-[var(--expense)]"
                            : "text-[var(--primary)]"
                        }`}
                      >
                        {formatCurrency(row.balance)}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>

          <div className="surface-card scrollbar-subtle hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">{year}년 월별 입금, 출금, 차액</caption>
              <thead className="bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--text-soft)]">
                <tr>
                  <th scope="col" className="px-6 py-4">월</th>
                  <th scope="col" className="px-6 py-4 text-right">입금 합계</th>
                  <th scope="col" className="px-6 py-4 text-right">출금 합계</th>
                  <th scope="col" className="px-6 py-4 text-right">차액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((row) => (
                  <tr key={row.month} className="transition hover:bg-[var(--surface-soft)]/70">
                    <th scope="row" className="px-6 py-4 text-base font-black text-[var(--text)]">
                      {row.month}월
                    </th>
                    <td className="money px-6 py-4 text-right font-bold text-[var(--income)]">
                      {formatCurrency(row.totalIncome)}
                    </td>
                    <td className="money px-6 py-4 text-right font-bold text-[var(--expense)]">
                      {formatCurrency(row.totalExpense)}
                    </td>
                    <td
                      className={`money px-6 py-4 text-right font-black ${
                        row.balance < zeroAmount
                          ? "text-[var(--expense)]"
                          : "text-[var(--primary)]"
                      }`}
                    >
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
