import { requireUser } from "@/features/auth/queries/require-user";
import { getMonthlyReport } from "@/features/reports/queries/get-monthly-report";
import { MonthlyReportScreen } from "@/features/reports/screens/MonthlyReportScreen";
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from "@/shared/utils/date";
import { getKoreaYear } from "@/shared/utils/format";

type MonthlyReportPageProps = {
  searchParams: Promise<{
    year?: string;
  }>;
};

export default async function MonthlyReportPage({ searchParams }: MonthlyReportPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const currentYear = getKoreaYear(new Date());
  const year = Number(params.year || currentYear);
  const safeYear =
    Number.isInteger(year) && year >= MIN_SUPPORTED_YEAR && year <= MAX_SUPPORTED_YEAR
      ? year
      : currentYear;
  const rows = await getMonthlyReport(user.id, safeYear);

  return <MonthlyReportScreen year={safeYear} rows={rows} />;
}
