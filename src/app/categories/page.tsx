import { requireUser } from "@/features/auth/queries/require-user";
import { getCategoriesWithTransactionCount } from "@/features/categories/queries/get-categories";
import { CategoryScreen } from "@/features/categories/screens/CategoryScreen";

export default async function CategoriesPage() {
  await requireUser();
  const categories = await getCategoriesWithTransactionCount();

  return <CategoryScreen categories={categories} />;
}
