import Link from "next/link";
import type { Category } from "@/db/schema";
import { toDateInputValue } from "@/shared/utils/format";
import { createTransaction } from "../actions/transaction-actions";
import { TransactionForm } from "../components/TransactionForm";

type TransactionCreateScreenProps = {
  categories: Category[];
  saved?: boolean;
};

export function TransactionCreateScreen({ categories, saved }: TransactionCreateScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header>
          <Link href="/transactions" className="text-base font-semibold text-zinc-600 hover:text-zinc-950">
            입출금 목록
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950">입출금 등록</h1>
        </header>

        {saved ? (
          <p className="rounded-md bg-green-50 px-4 py-3 text-base font-semibold text-green-700">
            저장했습니다. 이어서 입력할 수 있습니다.
          </p>
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
    </main>
  );
}
