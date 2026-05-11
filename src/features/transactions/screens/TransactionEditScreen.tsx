import Link from "next/link";
import type { Category, Transaction } from "@/db/schema";
import { updateTransaction } from "../actions/transaction-actions";
import { TransactionForm } from "../components/TransactionForm";

type TransactionEditScreenProps = {
  categories: Category[];
  transaction: Transaction;
};

export function TransactionEditScreen({ categories, transaction }: TransactionEditScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header>
          <Link href="/transactions" className="text-base font-semibold text-zinc-600 hover:text-zinc-950">
            입출금 목록
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950">입출금 수정</h1>
        </header>

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
    </main>
  );
}
