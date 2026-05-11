import { requireUser } from "@/features/auth/queries/require-user";
import { getMonthlyReport } from "@/features/reports/queries/get-monthly-report";
import { MonthlyReportScreen } from "@/features/reports/screens/MonthlyReportScreen";

type MonthlyReportPageProps = {
  searchParams: Promise<{
    year?: string;
  }>;
};

export default async function MonthlyReportPage({ searchParams }: MonthlyReportPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = Number(params.year || currentYear);
  const safeYear = Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : currentYear;
  const rows = await getMonthlyReport(user.id, safeYear);

  return <MonthlyReportScreen year={safeYear} rows={rows} />;
}
