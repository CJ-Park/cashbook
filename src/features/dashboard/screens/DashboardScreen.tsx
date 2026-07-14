import Link from "next/link";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SummaryCard } from "@/shared/components/ui/SummaryCard";
import { TypeBadge } from "@/shared/components/ui/TypeBadge";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import type { DashboardData, DashboardTransaction } from "../queries/get-dashboard-data";

type DashboardScreenProps = {
  email?: string;
  data: DashboardData;
};

export function DashboardScreen({ data }: DashboardScreenProps) {
  const balanceHint = data.balance >= BigInt(0) ? "입금이 출금보다 많아요" : "출금이 입금보다 많아요";

  return (
    <AppShell activeSection="dashboard">
      <div className="flex flex-col gap-8 lg:gap-10">
        <PageHeader
          eyebrow={`${data.monthLabel} 장부`}
          title="한눈에 보기"
          description="이번 달 입금과 출금 흐름을 확인하고, 필요한 내역을 바로 기록하세요."
          action={
            <Link href="/transactions/new" className="button-primary w-full sm:w-auto">
              <span aria-hidden="true" className="text-xl leading-none">
                +
              </span>
              새 내역 등록
            </Link>
          }
        />

        <section aria-labelledby="monthly-summary-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="monthly-summary-title" className="text-xl font-black tracking-[-0.03em] text-[var(--text)]">
                이번 달 핵심 요약
              </h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">{data.monthLabel} 전체 내역 기준입니다.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="입금 합계"
              value={formatCurrency(data.totalIncome)}
              tone="income"
              hint="이번 달 들어온 돈"
            />
            <SummaryCard
              label="출금 합계"
              value={formatCurrency(data.totalExpense)}
              tone="expense"
              hint="이번 달 나간 돈"
            />
            <div className="sm:col-span-2 xl:col-span-1">
              <SummaryCard
                label="현재 차액"
                value={formatCurrency(data.balance)}
                tone={data.balance < BigInt(0) ? "expense" : "balance"}
                hint={balanceHint}
                featured
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="recent-transactions-title" className="surface-card overflow-hidden">
          <header className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2
                id="recent-transactions-title"
                className="text-xl font-black tracking-[-0.03em] text-[var(--text)] sm:text-2xl"
              >
                최근 입출금 내역
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                가장 최근에 기록한 내역을 최대 10건까지 보여드려요.
              </p>
            </div>
            <Link href="/transactions" className="button-secondary w-full shrink-0 sm:w-auto">
              전체 내역 보기
              <span aria-hidden="true">→</span>
            </Link>
          </header>

          {data.recentTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-8 sm:py-16">
              <span
                aria-hidden="true"
                className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl font-black text-[var(--primary)]"
              >
                +
              </span>
              <h3 className="mt-4 text-lg font-black text-[var(--text)]">아직 등록된 내역이 없어요</h3>
              <p className="mt-2 text-base text-[var(--text-soft)]">첫 입출금 내역을 간단하게 기록해보세요.</p>
              <Link href="/transactions/new" className="button-primary mt-6">
                첫 내역 등록하기
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--border)] lg:hidden">
                {data.recentTransactions.map((transaction) => (
                  <RecentTransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>

              <div className="scrollbar-subtle hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <caption className="sr-only">최근 입출금 내역 10건</caption>
                  <thead className="bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--text-soft)]">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">
                        날짜
                      </th>
                      <th scope="col" className="px-4 py-3.5">
                        구분
                      </th>
                      <th scope="col" className="px-4 py-3.5">
                        카테고리
                      </th>
                      <th scope="col" className="px-4 py-3.5">
                        내용
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right">
                        금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="transition-colors hover:bg-[var(--surface-soft)]/65">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-[var(--text-soft)]">
                          <time dateTime={transaction.transactionDate}>{formatDate(transaction.transactionDate)}</time>
                        </td>
                        <td className="px-4 py-4">
                          <TypeBadge type={transaction.type} compact />
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[var(--text-soft)]">
                          {transaction.categoryName}
                        </td>
                        <td className="max-w-xs px-4 py-4 font-bold text-[var(--text)]">
                          <span className="line-clamp-2">{transaction.title}</span>
                        </td>
                        <td
                          className={`money whitespace-nowrap px-6 py-4 text-right text-base font-black ${
                            transaction.type === "INCOME" ? "text-income" : "text-expense"
                          }`}
                        >
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function RecentTransactionCard({ transaction }: { transaction: DashboardTransaction }) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <TypeBadge type={transaction.type} compact />
        <time dateTime={transaction.transactionDate} className="text-sm font-semibold text-[var(--text-faint)]">
          {formatDate(transaction.transactionDate)}
        </time>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-[var(--text)]">{transaction.title}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--text-soft)]">
            {transaction.categoryName}
          </p>
        </div>
        <p
          className={`money shrink-0 text-lg font-black ${
            transaction.type === "INCOME" ? "text-income" : "text-expense"
          }`}
        >
          {formatCurrency(transaction.amount)}
        </p>
      </div>
    </article>
  );
}
