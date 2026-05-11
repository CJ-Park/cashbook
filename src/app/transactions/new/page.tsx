import { requireUser } from "@/features/auth/queries/require-user";
import { getActiveCategories } from "@/features/categories/queries/get-categories";
import { TransactionCreateScreen } from "@/features/transactions/screens/TransactionCreateScreen";

type TransactionNewPageProps = {
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function TransactionNewPage({ searchParams }: TransactionNewPageProps) {
  const user = await requireUser();
  const [categories, params] = await Promise.all([getActiveCategories(user.id), searchParams]);

  return <TransactionCreateScreen categories={categories} saved={params.saved === "1"} />;
}
