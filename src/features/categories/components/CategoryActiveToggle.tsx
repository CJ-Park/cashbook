import { toggleCategoryActive } from "../actions/category-actions";
import { SubmitButton } from "@/shared/components/ui/SubmitButton";

type CategoryActiveToggleProps = {
  id: number;
  isActive: boolean;
  transactionCount: number;
};

export function CategoryActiveToggle({ id, isActive, transactionCount }: CategoryActiveToggleProps) {
  return (
    <form action={toggleCategoryActive} className="flex flex-col items-start gap-2 sm:items-end">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <SubmitButton
        pendingLabel="변경 중..."
        className={`${isActive ? "button-secondary" : "button-primary"} min-h-12 w-full sm:w-auto`}
      >
        {isActive ? "사용 중지" : "다시 사용"}
      </SubmitButton>
      {!isActive ? (
        <p className="max-w-xs text-sm leading-6 text-[var(--text-soft)] sm:text-right">
          새 내역의 선택 목록에는 표시되지 않습니다.
        </p>
      ) : transactionCount > 0 ? (
        <p className="max-w-xs text-sm leading-6 text-[var(--text-soft)] sm:text-right">
          거래 {transactionCount.toLocaleString("ko-KR")}건은 그대로 유지됩니다.
        </p>
      ) : null}
    </form>
  );
}
