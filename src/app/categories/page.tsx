import { requireUser } from "@/features/auth/queries/require-user";

export default async function CategoriesPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-950">카테고리 관리</h1>
        <p className="mt-3 text-lg text-zinc-600">카테고리 기능은 다음 Phase에서 구현합니다.</p>
      </section>
    </main>
  );
}
