import type { CategoryRow } from "../types";
import { CategoryActiveToggle } from "../components/CategoryActiveToggle";
import { CategoryForm } from "../components/CategoryForm";

type CategoryScreenProps = {
  categories: CategoryRow[];
};

const typeLabels = {
  INCOME: "입금",
  EXPENSE: "출금",
  COMMON: "공통",
};

export function CategoryScreen({ categories }: CategoryScreenProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header>
          <p className="text-base font-semibold text-zinc-500">cashbook</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-950">카테고리 관리</h1>
        </header>

        <section>
          <h2 className="mb-3 text-xl font-bold text-zinc-950">카테고리 추가</h2>
          <CategoryForm />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-xl font-bold text-zinc-950">카테고리 목록</h2>
          </div>

          {categories.length === 0 ? (
            <p className="p-8 text-center text-lg font-semibold text-zinc-700">등록된 카테고리가 없습니다.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {categories.map((category) => (
                <div key={category.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px]">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
                        {typeLabels[category.type]}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
                        정렬 {category.sortOrder}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
                        거래 {category.transactionCount}건
                      </span>
                      <span
                        className={
                          category.isActive
                            ? "rounded-md bg-green-50 px-3 py-1 text-sm font-bold text-green-700"
                            : "rounded-md bg-zinc-200 px-3 py-1 text-sm font-bold text-zinc-600"
                        }
                      >
                        {category.isActive ? "사용 중" : "사용 안 함"}
                      </span>
                    </div>
                    <CategoryForm category={category} />
                  </div>

                  <div className="lg:pt-9">
                    <CategoryActiveToggle
                      id={category.id}
                      isActive={category.isActive}
                      transactionCount={category.transactionCount}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
