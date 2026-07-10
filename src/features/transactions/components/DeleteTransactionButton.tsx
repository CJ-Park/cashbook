"use client";

import { SubmitButton } from "@/shared/components/ui/SubmitButton";

type DeleteTransactionButtonProps = {
  id: number;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteTransactionButton({ id, action }: DeleteTransactionButtonProps) {
  return (
    <form
      action={action}
      className="flex"
      onSubmit={(event) => {
        if (!window.confirm("이 입출금 내역을 삭제할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        pendingLabel="삭제 중..."
        className="button-danger min-h-11 w-full px-3 py-2 text-sm sm:w-auto"
      >
        삭제
      </SubmitButton>
    </form>
  );
}
