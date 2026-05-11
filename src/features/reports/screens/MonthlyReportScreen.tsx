import { formatCurrency } from "@/shared/utils/format";
import type { MonthlyReportRow } from "../types";

type MonthlyReportScreenProps = {
  year: number;
  rows: MonthlyReportRow[];
};

export function MonthlyReportScreen({ year, rows }: MonthlyReportScreenProps) {
  const hasData = rows.some((row) => row.totalIncome > 0 || row.totalExpense > 0);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header>
          <p className="text-base font-semibold text-zinc-500">cashbook</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-950">월별 통계</h1>
        </header>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-zinc-700">연도</span>
            <input
              name="year"
              type="number"
              min="2000"
              max="2100"
              defaultValue={year}
              className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
            />
          </label>
          <button
            type="submit"
            className="mt-4 min-h-12 rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
          >
            조회
          </button>
        </form>

        {!hasData ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-zinc-700">선택한 연도의 입출금 내역이 없습니다.</p>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-zinc-100 text-sm font-semibold text-zinc-600">
              <tr>
                <th className="px-5 py-3">월</th>
                <th className="px-5 py-3 text-right">입금 합계</th>
                <th className="px-5 py-3 text-right">출금 합계</th>
                <th className="px-5 py-3 text-right">차액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row) => (
                <tr key={row.month}>
                  <td className="px-5 py-4 font-semibold text-zinc-900">{row.month}월</td>
                  <td className="px-5 py-4 text-right text-zinc-700">
                    {formatCurrency(row.totalIncome)}
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-700">
                    {formatCurrency(row.totalExpense)}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-zinc-950">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
