import { redirect } from "next/navigation";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { getCurrentUser } from "@/features/auth/queries/get-current-user";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return <LoginScreen error={params.error} nextPath={params.next} />;
}
