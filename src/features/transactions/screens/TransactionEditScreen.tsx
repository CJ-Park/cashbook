import type { Category, Transaction } from "@/db/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { updateTransaction } from "../actions/transaction-actions";
import { TransactionForm } from "../components/TransactionForm";

type TransactionEditScreenProps = {
  categories: Category[];
  transaction: Transaction;
};

export function TransactionEditScreen({ categories, transaction }: TransactionEditScreenProps) {
  return (
    <AppShell activeSection="transactions">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader
          title="입출금 내역 수정"
          description="수정할 내용을 확인하고 저장해주세요."
          backHref="/transactions"
          backLabel="입출금 목록"
        />

        <TransactionForm
          mode="edit"
          categories={categories}
          action={updateTransaction}
          defaultValues={{
            id: transaction.id,
            transactionDate: transaction.transactionDate,
            type: transaction.type,
            categoryId: transaction.categoryId,
            title: transaction.title,
            amount: transaction.amount,
            memo: transaction.memo,
            paymentMethod: transaction.paymentMethod,
          }}
        />
      </section>
    </AppShell>
  );
}
