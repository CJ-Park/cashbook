import { requireUser } from "@/features/auth/queries/require-user";
import { getDashboardData } from "@/features/dashboard/queries/get-dashboard-data";
import { DashboardScreen } from "@/features/dashboard/screens/DashboardScreen";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData();

  return <DashboardScreen email={user.email} data={data} />;
}
