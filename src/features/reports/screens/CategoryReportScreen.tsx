import Link from "next/link";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SummaryCard } from "@/shared/components/ui/SummaryCard";
import { TypeBadge } from "@/shared/components/ui/TypeBadge";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import type { CategoryReportCondition, CategoryReportRow } from "../types";
import { calculateProgressPercentage } from "../utils/calculate-progress-percentage";

type CategoryReportScreenProps = {
  condition: CategoryReportCondition;
  rows: CategoryReportRow[];
};

export function CategoryReportScreen({ condition, rows }: CategoryReportScreenProps) {
  const zeroAmount = BigInt(0);
  const totalAmount = rows.reduce(
    (total, row) => total + row.totalAmount,
    zeroAmount,
  );
  const maxAmount = rows.reduce(
    (maximum, row) => (row.totalAmount > maximum ? row.totalAmount : maximum),
    zeroAmount,
  );
  const periodLabel = getPeriodLabel(condition);
  const summaryTone = condition.type === "INCOME" ? "income" : condition.type === "EXPENSE" ? "expense" : "balance";
  const typeLabel = condition.type === "INCOME" ? "입금만" : condition.type === "EXPENSE" ? "출금만" : "입금·출금 전체";

  return (
    <AppShell activeSection="reports">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
        <PageHeader
          backHref="/reports"
          backLabel="통계 목록"
          title="카테고리별 통계"
          description="선택한 기간에 어떤 카테고리의 금액이 큰지 순서대로 확인합니다."
          action={
            <Link href="/reports/monthly" className="button-secondary min-h-12">
              월별 통계
            </Link>
          }
        />

        <section aria-labelledby="category-report-filter-title" className="surface-card p-5 sm:p-6">
          <div>
            <h2 id="category-report-filter-title" className="text-lg font-black tracking-[-0.02em] text-[var(--text)]">
              조회 조건
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              날짜를 비워두면 등록된 전체 기간을 조회합니다.
            </p>
          </div>

          <form className="mt-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]">
              <label className="block">
                <span className="field-label">시작일</span>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={condition.startDate}
                  className="field-control"
                />
              </label>

              <label className="block">
                <span className="field-label">종료일</span>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={condition.endDate}
                  className="field-control"
                />
              </label>

              <label className="block md:col-span-2 xl:col-span-1">
                <span className="field-label">입출금 구분</span>
                <select name="type" defaultValue={condition.type ?? ""} className="field-control">
                  <option value="">입금·출금 전체</option>
                  <option value="INCOME">입금만</option>
                  <option value="EXPENSE">출금만</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="button-primary min-h-13 w-full sm:w-auto">
                이 조건으로 조회
              </button>
              <Link href="/reports/category" className="button-secondary min-h-13 w-full sm:w-auto">
                조건 초기화
              </Link>
            </div>
          </form>
          {condition.validationError ? (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-bold text-[var(--danger)]"
            >
              {condition.validationError} 날짜를 다시 확인해주세요.
            </p>
          ) : null}
        </section>

        <section aria-label="카테고리 통계 요약" className="grid gap-4 sm:grid-cols-2">
          <SummaryCard
            label="조회 금액 합계"
            value={formatCurrency(totalAmount)}
            tone={summaryTone}
            hint={`${periodLabel} · ${typeLabel}`}
            featured
          />
          <SummaryCard
            label="조회된 카테고리"
            value={`${rows.length.toLocaleString("ko-KR")}개`}
            tone="neutral"
            hint="금액이 큰 순서로 정렬"
          />
        </section>

        <section aria-labelledby="category-ranking-title" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="category-ranking-title" className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">
                카테고리 순위
              </h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">합계가 큰 카테고리부터 보여드립니다.</p>
            </div>
            <p className="text-sm font-extrabold text-[var(--text-faint)]">{periodLabel}</p>
          </div>

          {rows.length === 0 ? (
            <div className="surface-card border-dashed px-5 py-12 text-center" aria-live="polite">
              <span
                aria-hidden="true"
                className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-lg font-black text-[var(--text-soft)]"
              >
                분
              </span>
              <h3 className="mt-4 text-lg font-black text-[var(--text)]">선택한 조건의 내역이 없습니다.</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                기간을 넓히거나 입출금 구분을 전체로 바꿔보세요.
              </p>
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)_13rem] border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-3 text-sm font-extrabold text-[var(--text-soft)] sm:grid">
                <span>순위</span>
                <span>카테고리</span>
                <span className="text-right">합계</span>
              </div>

              <ol className="divide-y divide-[var(--border)]">
                {rows.map((row, index) => {
                  const progress = calculateProgressPercentage(row.totalAmount, maxAmount);
                  const progressColor =
                    row.categoryType === "INCOME"
                      ? "var(--income)"
                      : row.categoryType === "EXPENSE"
                        ? "var(--expense)"
                        : "var(--primary)";

                  return (
                    <li
                      key={row.categoryId}
                      className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 px-5 py-5 transition hover:bg-[var(--surface-soft)]/65 sm:grid-cols-[3.5rem_minmax(0,1fr)_13rem] sm:items-center sm:px-6"
                    >
                      <span
                        aria-label={`${index + 1}위`}
                        className={`row-span-2 flex size-10 items-center justify-center self-start rounded-2xl text-sm font-black sm:row-span-1 sm:self-center ${
                          index < 3
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "bg-[var(--surface-soft)] text-[var(--text-soft)]"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="min-w-0 sm:pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-lg font-black tracking-[-0.025em] text-[var(--text)]">
                            {row.categoryName}
                          </h3>
                          <ReportTypeBadge type={row.categoryType} />
                        </div>
                      </div>

                      <p className="money col-start-2 break-words text-xl font-black text-[var(--text)] sm:col-start-3 sm:row-start-1 sm:text-right">
                        {formatCurrency(row.totalAmount)}
                      </p>

                      <div
                        aria-hidden="true"
                        className="col-start-2 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)] sm:col-end-4"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${progress}%`, backgroundColor: progressColor }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ReportTypeBadge({ type }: { type: CategoryReportRow["categoryType"] }) {
  if (type === "COMMON") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--primary)]">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--primary)]" />
        공통
      </span>
    );
  }

  return <TypeBadge type={type} compact />;
}

function getPeriodLabel(condition: CategoryReportCondition) {
  if (condition.startDate && condition.endDate) {
    return `${formatDate(condition.startDate)} ~ ${formatDate(condition.endDate)}`;
  }

  if (condition.startDate) {
    return `${formatDate(condition.startDate)} 이후`;
  }

  if (condition.endDate) {
    return `${formatDate(condition.endDate)}까지`;
  }

  return "전체 기간";
}
