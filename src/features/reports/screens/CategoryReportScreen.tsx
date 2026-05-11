import { formatCurrency } from "@/shared/utils/format";
import type { CategoryReportCondition, CategoryReportRow } from "../types";

type CategoryReportScreenProps = {
  condition: CategoryReportCondition;
  rows: CategoryReportRow[];
};

const typeLabels = {
  INCOME: "입금",
  EXPENSE: "출금",
  COMMON: "공통",
};

export function CategoryReportScreen({ condition, rows }: CategoryReportScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header>
          <p className="text-base font-semibold text-zinc-500">cashbook</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-950">카테고리별 통계</h1>
        </header>

        <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700">시작일</span>
              <input
                name="startDate"
                type="date"
                defaultValue={condition.startDate}
                className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700">종료일</span>
              <input
                name="endDate"
                type="date"
                defaultValue={condition.endDate}
                className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700">구분</span>
              <select
                name="type"
                defaultValue={condition.type ?? ""}
                className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
              >
                <option value="">전체</option>
                <option value="INCOME">입금</option>
                <option value="EXPENSE">출금</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 min-h-12 rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
          >
            조회
          </button>
        </form>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-zinc-700">선택한 조건의 통계 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-zinc-100 text-sm font-semibold text-zinc-600">
                <tr>
                  <th className="px-5 py-3">카테고리</th>
                  <th className="px-5 py-3">구분</th>
                  <th className="px-5 py-3 text-right">합계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((row) => (
                  <tr key={row.categoryId}>
                    <td className="px-5 py-4 font-semibold text-zinc-950">{row.categoryName}</td>
                    <td className="px-5 py-4 text-zinc-700">{typeLabels[row.categoryType]}</td>
                    <td className="px-5 py-4 text-right font-bold text-zinc-950">
                      {formatCurrency(row.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
