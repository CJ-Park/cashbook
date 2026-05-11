import { requireUser } from "@/features/auth/queries/require-user";
import {
  getCategoryReport,
  parseCategoryReportParams,
} from "@/features/reports/queries/get-category-report";
import { CategoryReportScreen } from "@/features/reports/screens/CategoryReportScreen";

type CategoryReportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryReportPage({ searchParams }: CategoryReportPageProps) {
  await requireUser();
  const params = await searchParams;
  const condition = parseCategoryReportParams(params);
  const rows = await getCategoryReport(condition);

  return <CategoryReportScreen condition={condition} rows={rows} />;
}
