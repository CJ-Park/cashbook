import Link from "next/link";
import type { Category } from "@/db/schema";
import type { TransactionSearchCondition } from "../types";

type TransactionSearchFormProps = {
  categories: Category[];
  condition: TransactionSearchCondition;
};

export function TransactionSearchForm({ categories, condition }: TransactionSearchFormProps) {
  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-5">
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

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-zinc-700">카테고리</span>
          <select
            name="categoryId"
            defaultValue={condition.categoryId ?? ""}
            className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
          >
            <option value="">전체</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-zinc-700">검색어</span>
          <input
            name="keyword"
            type="search"
            defaultValue={condition.keyword}
            className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="min-h-12 rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
        >
          검색
        </button>
        <Link
          href="/transactions"
          className="flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-base font-bold text-zinc-900 hover:bg-zinc-100"
        >
          초기화
        </Link>
      </div>
    </form>
  );
}
