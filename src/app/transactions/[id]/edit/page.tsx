import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/queries/require-user";
import { getActiveCategories } from "@/features/categories/queries/get-categories";
import { getTransactionById } from "@/features/transactions/queries/get-transaction-by-id";
import { TransactionEditScreen } from "@/features/transactions/screens/TransactionEditScreen";

type TransactionEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TransactionEditPage({ params }: TransactionEditPageProps) {
  const user = await requireUser();

  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    notFound();
  }

  const [categories, transaction] = await Promise.all([
    getActiveCategories(user.id),
    getTransactionById(user.id, transactionId),
  ]);

  if (!transaction) {
    notFound();
  }

  return <TransactionEditScreen categories={categories} transaction={transaction} />;
}
