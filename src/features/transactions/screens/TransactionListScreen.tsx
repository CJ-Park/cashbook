import Link from "next/link";
import type { Category } from "@/db/schema";
import type { TransactionSearchCondition, TransactionSearchResult } from "../types";
import { TransactionSearchForm } from "../components/TransactionSearchForm";
import { TransactionSummary } from "../components/TransactionSummary";
import { TransactionTable } from "../components/TransactionTable";

type TransactionListScreenProps = {
  categories: Category[];
  condition: TransactionSearchCondition;
  result: TransactionSearchResult;
};

export function TransactionListScreen({ categories, condition, result }: TransactionListScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-500">cashbook</p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-950">입출금 내역</h1>
          </div>
          <Link
            href="/transactions/new"
            className="flex min-h-12 items-center justify-center rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
          >
            입출금 등록
          </Link>
        </header>

        <TransactionSearchForm categories={categories} condition={condition} />
        <TransactionSummary
          totalIncome={result.totalIncome}
          totalExpense={result.totalExpense}
          balance={result.balance}
        />
        <TransactionTable transactions={result.transactions} />
      </section>
    </main>
  );
}
