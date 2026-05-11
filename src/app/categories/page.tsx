import { requireUser } from "@/features/auth/queries/require-user";
import { getCategoriesWithTransactionCount } from "@/features/categories/queries/get-categories";
import { CategoryScreen } from "@/features/categories/screens/CategoryScreen";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await getCategoriesWithTransactionCount(user.id);

  return <CategoryScreen categories={categories} />;
}
