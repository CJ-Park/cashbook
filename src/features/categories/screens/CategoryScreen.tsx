import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { TypeBadge } from "@/shared/components/ui/TypeBadge";
import type { CategoryRow, CategoryType } from "../types";
import { CategoryActiveToggle } from "../components/CategoryActiveToggle";
import { CategoryForm } from "../components/CategoryForm";

type CategoryScreenProps = {
  categories: CategoryRow[];
};

const categoryGroups: Array<{
  type: CategoryType;
  title: string;
  description: string;
  markerClass: string;
}> = [
  {
    type: "EXPENSE",
    title: "출금 카테고리",
    description: "재료비, 택배비처럼 돈이 나갈 때 선택합니다.",
    markerClass: "bg-[var(--expense)]",
  },
  {
    type: "INCOME",
    title: "입금 카테고리",
    description: "판매수입, 현금입금처럼 돈이 들어올 때 선택합니다.",
    markerClass: "bg-[var(--income)]",
  },
  {
    type: "COMMON",
    title: "공통 카테고리",
    description: "입금과 출금 양쪽에서 모두 사용할 수 있습니다.",
    markerClass: "bg-[var(--primary)]",
  },
];

export function CategoryScreen({ categories }: CategoryScreenProps) {
  return (
    <AppShell activeSection="categories">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
        <PageHeader
          eyebrow="CATEGORY"
          title="카테고리 관리"
          description="장부에 자주 쓰는 이름을 추가하고, 더 이상 쓰지 않는 항목은 잠시 숨겨둘 수 있어요."
        />

        <section aria-labelledby="new-category-title" className="surface-card overflow-hidden">
          <div className="border-b border-[var(--border)] bg-[var(--primary-soft)] px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white"
              >
                +
              </span>
              <div>
                <h2 id="new-category-title" className="text-xl font-black tracking-[-0.025em] text-[var(--text)]">
                  새 카테고리 추가
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                  이름과 사용할 곳만 고르면 바로 추가됩니다.
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <CategoryForm />
          </div>
        </section>

        <section aria-labelledby="category-list-title" className="space-y-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="category-list-title" className="text-2xl font-black tracking-[-0.035em] text-[var(--text)]">
                등록된 카테고리
              </h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                총 {categories.length.toLocaleString("ko-KR")}개가 등록되어 있습니다.
              </p>
            </div>
            <p className="text-sm font-bold text-[var(--text-faint)]">출금 · 입금 · 공통 순서로 보여드려요.</p>
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-2">
            {categoryGroups.map((group) => {
              const groupedCategories = categories.filter((category) => category.type === group.type);
              const activeCount = groupedCategories.filter((category) => category.isActive).length;

              return (
                <section
                  key={group.type}
                  aria-labelledby={`category-group-${group.type}`}
                  className={`surface-card overflow-hidden ${group.type === "COMMON" ? "xl:col-span-2" : ""}`}
                >
                  <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <span aria-hidden="true" className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${group.markerClass}`} />
                      <div>
                        <h3
                          id={`category-group-${group.type}`}
                          className="text-lg font-black tracking-[-0.02em] text-[var(--text)]"
                        >
                          {group.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{group.description}</p>
                      </div>
                    </div>
                    <span className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-white px-3 text-sm font-extrabold text-[var(--text-soft)] shadow-sm">
                      사용 중 {activeCount}개
                    </span>
                  </div>

                  {groupedCategories.length === 0 ? (
                    <div className="px-5 py-10 text-center sm:px-6">
                      <p className="font-bold text-[var(--text-soft)]">아직 등록된 카테고리가 없습니다.</p>
                      <p className="mt-1 text-sm text-[var(--text-faint)]">위 입력란에서 바로 추가해보세요.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {groupedCategories.map((category) => (
                        <article
                          key={category.id}
                          className={`p-5 sm:p-6 ${category.isActive ? "bg-white" : "bg-[var(--surface-soft)]/55"}`}
                        >
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                <CategoryTypeBadge type={category.type} />
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                                    category.isActive
                                      ? "bg-[var(--income-soft)] text-[var(--income)]"
                                      : "bg-[var(--surface-soft)] text-[var(--text-soft)] ring-1 ring-[var(--border)]"
                                  }`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`size-1.5 rounded-full ${
                                      category.isActive ? "bg-[var(--income)]" : "bg-[var(--text-faint)]"
                                    }`}
                                  />
                                  {category.isActive ? "사용 중" : "사용 안 함"}
                                </span>
                              </div>
                              <h4 className="break-words text-xl font-black tracking-[-0.025em] text-[var(--text)]">
                                {category.name}
                              </h4>
                              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold text-[var(--text-soft)]">
                                <span>거래 {category.transactionCount.toLocaleString("ko-KR")}건</span>
                                <span aria-hidden="true">·</span>
                                <span>표시 순서 {category.sortOrder.toLocaleString("ko-KR")}</span>
                              </p>
                            </div>

                            <CategoryActiveToggle
                              id={category.id}
                              isActive={category.isActive}
                              transactionCount={category.transactionCount}
                            />
                          </div>

                          <details className="group mt-5 rounded-2xl border border-[var(--border)] bg-white">
                            <summary className="flex min-h-12 list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-[var(--primary)] hover:bg-[var(--primary-soft)] [&::-webkit-details-marker]:hidden">
                              카테고리 정보 수정
                              <span
                                aria-hidden="true"
                                className="flex size-7 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-base transition group-open:rotate-180"
                              >
                                ↓
                              </span>
                            </summary>
                            <div className="border-t border-[var(--border)] p-4 sm:p-5">
                              <p className="mb-4 text-sm leading-6 text-[var(--text-soft)]">
                                표시 순서는 숫자가 작을수록 선택 목록의 앞쪽에 나타납니다.
                              </p>
                              <CategoryForm
                                category={category}
                                stackedOnDesktop={group.type !== "COMMON"}
                              />
                            </div>
                          </details>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function CategoryTypeBadge({ type }: { type: CategoryType }) {
  if (type === "COMMON") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--primary)]">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--primary)]" />
        공통
      </span>
    );
  }

  return <TypeBadge type={type} compact />;
}
