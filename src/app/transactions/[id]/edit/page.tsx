import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/queries/require-user";
import { getCategoriesForTransactionEdit } from "@/features/categories/queries/get-categories";
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

  const transaction = await getTransactionById(user.id, transactionId);

  if (!transaction) {
    notFound();
  }

  const categories = await getCategoriesForTransactionEdit(user.id, transaction.categoryId);

  return <TransactionEditScreen categories={categories} transaction={transaction} />;
}
