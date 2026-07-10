import type { CategoryRow } from "../types";
import { createCategory, updateCategory } from "../actions/category-actions";
import { SubmitButton } from "@/shared/components/ui/SubmitButton";

type CategoryFormProps = {
  category?: CategoryRow;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const action = category ? updateCategory : createCategory;

  return (
    <form
      action={action}
      className={`grid gap-4 ${
        category
          ? "md:grid-cols-[minmax(0,1fr)_10rem_9rem_auto] md:items-end"
          : "md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end"
      }`}
    >
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {!category ? <input type="hidden" name="sortOrder" value="0" /> : null}

      <label className="block">
        <span className="field-label">카테고리 이름</span>
        <input
          name="name"
          type="text"
          required
          maxLength={50}
          autoComplete="off"
          placeholder="예: 재료비, 판매수입"
          defaultValue={category?.name}
          className="field-control"
        />
      </label>

      <label className="block">
        <span className="field-label">사용할 곳</span>
        <select
          name="type"
          defaultValue={category?.type ?? "EXPENSE"}
          className="field-control"
        >
          <option value="EXPENSE">출금에 사용</option>
          <option value="INCOME">입금에 사용</option>
          <option value="COMMON">입금·출금 공통</option>
        </select>
      </label>

      {category ? (
        <label className="block">
          <span className="field-label">표시 순서</span>
          <input
            name="sortOrder"
            type="number"
            inputMode="numeric"
            defaultValue={category.sortOrder}
            className="field-control money"
          />
        </label>
      ) : null}

      <SubmitButton
        pendingLabel={category ? "저장 중..." : "추가 중..."}
        className="button-primary min-h-13 w-full md:w-auto"
      >
        {category ? "변경 저장" : "카테고리 추가"}
      </SubmitButton>
    </form>
  );
}
