"use client";

type DeleteTransactionButtonProps = {
  id: number;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteTransactionButton({ id, action }: DeleteTransactionButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("이 입출금 내역을 삭제할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="font-semibold text-red-600 hover:text-red-700">
        삭제
      </button>
    </form>
  );
}
