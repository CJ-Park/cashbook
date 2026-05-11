import { toggleCategoryActive } from "../actions/category-actions";

type CategoryActiveToggleProps = {
  id: number;
  isActive: boolean;
  transactionCount: number;
};

export function CategoryActiveToggle({ id, isActive, transactionCount }: CategoryActiveToggleProps) {
  return (
    <form action={toggleCategoryActive}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <button
        type="submit"
        className="min-h-10 rounded-md border border-zinc-300 px-4 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
      >
        {isActive ? "사용 안 함" : "다시 사용"}
      </button>
      {transactionCount > 0 ? (
        <p className="mt-2 text-xs text-zinc-500">거래 내역이 있어 비활성 처리합니다.</p>
      ) : null}
    </form>
  );
}
