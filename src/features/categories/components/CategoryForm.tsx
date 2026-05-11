import type { CategoryRow } from "../types";
import { createCategory, updateCategory } from "../actions/category-actions";

type CategoryFormProps = {
  category?: CategoryRow;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category ? updateCategory : createCategory;

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_140px_120px_auto] md:items-end">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">카테고리명</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={category?.name}
          className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">구분</span>
        <select
          name="type"
          defaultValue={category?.type ?? "EXPENSE"}
          className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
        >
          <option value="INCOME">입금</option>
          <option value="EXPENSE">출금</option>
          <option value="COMMON">공통</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-zinc-700">정렬</span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
          className="min-h-11 w-full rounded-md border border-zinc-300 px-3 text-base"
        />
      </label>

      <button
        type="submit"
        className="min-h-11 rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
      >
        {category ? "수정" : "추가"}
      </button>
    </form>
  );
}
