import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { requireUser } from "@/features/auth/queries/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-500">cashbook</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-950">로그인 완료</h1>
            <p className="mt-3 text-lg text-zinc-600">{user.email} 계정으로 접속 중입니다.</p>
          </div>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
