import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { DashboardData } from "../queries/get-dashboard-data";
import { formatCurrency, formatDate } from "@/shared/utils/format";

type DashboardScreenProps = {
  email?: string;
  data: DashboardData;
};

export function DashboardScreen({ email, data }: DashboardScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-500">cashbook</p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-950">대시보드</h1>
            {email ? <p className="mt-2 text-base text-zinc-600">{email}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/transactions/new"
              className="flex min-h-12 items-center justify-center rounded-md bg-zinc-900 px-5 text-base font-bold text-white shadow-sm hover:bg-zinc-800"
            >
              입출금 등록
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label={`${data.monthLabel} 입금`} value={formatCurrency(data.totalIncome)} />
          <SummaryCard label={`${data.monthLabel} 출금`} value={formatCurrency(data.totalExpense)} />
          <SummaryCard label={`${data.monthLabel} 차액`} value={formatCurrency(data.balance)} />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-2xl font-bold text-zinc-950">최근 입출금 내역</h2>
          </div>

          {data.recentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-semibold text-zinc-700">아직 등록된 입출금 내역이 없습니다.</p>
              <Link
                href="/transactions/new"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-900 px-5 text-base font-bold text-white shadow-sm hover:bg-zinc-800"
              >
                첫 내역 등록하기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-zinc-100 text-sm font-semibold text-zinc-600">
                  <tr>
                    <th className="px-5 py-3">날짜</th>
                    <th className="px-5 py-3">구분</th>
                    <th className="px-5 py-3">카테고리</th>
                    <th className="px-5 py-3">내용</th>
                    <th className="px-5 py-3 text-right">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-5 py-4 text-zinc-700">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-900">
                        {transaction.type === "INCOME" ? "입금" : "출금"}
                      </td>
                      <td className="px-5 py-4 text-zinc-700">{transaction.categoryName}</td>
                      <td className="px-5 py-4 text-zinc-900">{transaction.title}</td>
                      <td className="px-5 py-4 text-right font-bold text-zinc-950">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-base font-semibold text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}
