import type { Category } from "@/db/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { toDateInputValue } from "@/shared/utils/format";
import { createTransaction } from "../actions/transaction-actions";
import { TransactionForm } from "../components/TransactionForm";

type TransactionCreateScreenProps = {
  categories: Category[];
  saved?: boolean;
};

export function TransactionCreateScreen({ categories, saved }: TransactionCreateScreenProps) {
  return (
    <AppShell activeSection="new">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader
          title="새 입출금 등록"
          description="날짜와 구분, 카테고리, 금액을 확인한 뒤 저장해주세요."
          backHref="/transactions"
          backLabel="입출금 목록"
        />

        {saved ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-2xl border border-[#b9dfd1] bg-[var(--income-soft)] px-4 py-3.5 text-[var(--income)]"
          >
            <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--income)] text-sm font-black text-white">
              ✓
            </span>
            <p className="font-extrabold">저장했습니다. 새 내역을 이어서 입력할 수 있어요.</p>
          </div>
        ) : null}

        <TransactionForm
          mode="create"
          categories={categories}
          action={createTransaction}
          defaultValues={{
            transactionDate: toDateInputValue(new Date()),
            type: "EXPENSE",
          }}
        />
      </section>
    </AppShell>
  );
}
