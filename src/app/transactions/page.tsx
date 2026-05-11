import { requireUser } from "@/features/auth/queries/require-user";
import { getActiveCategories } from "@/features/categories/queries/get-categories";
import { getTransactions } from "@/features/transactions/queries/get-transactions";
import { parseTransactionSearchParams } from "@/features/transactions/queries/search-conditions";
import { TransactionListScreen } from "@/features/transactions/screens/TransactionListScreen";

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  await requireUser();
  const params = await searchParams;
  const condition = parseTransactionSearchParams(params);
  const [categories, result] = await Promise.all([
    getActiveCategories(),
    getTransactions(condition),
  ]);

  return <TransactionListScreen categories={categories} condition={condition} result={result} />;
}
