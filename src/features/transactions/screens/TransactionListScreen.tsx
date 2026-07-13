import Link from "next/link";
import type { Category } from "@/db/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import type { TransactionSearchCondition, TransactionSearchResult } from "../types";
import { TransactionSearchForm } from "../components/TransactionSearchForm";
import { TransactionSummary } from "../components/TransactionSummary";
import { TransactionTable } from "../components/TransactionTable";
import { createTransactionSearchParams } from "../queries/search-conditions";

type TransactionListScreenProps = {
  categories: Category[];
  condition: TransactionSearchCondition;
  result: TransactionSearchResult;
};

export function TransactionListScreen({ categories, condition, result }: TransactionListScreenProps) {
  const searchFormKey = [
    condition.startDate ?? "",
    condition.endDate ?? "",
    condition.type ?? "",
    condition.categoryId ?? "",
    condition.keyword ?? "",
  ].join("|");
  const exportSearchParams = createTransactionSearchParams(condition).toString();
  const exportHref = `/api/export${exportSearchParams ? `?${exportSearchParams}` : ""}`;

  return (
    <AppShell activeSection="transactions">
      <section className="flex w-full flex-col gap-6 lg:gap-7">
        <PageHeader
          eyebrow="TRANSACTIONS"
          title="입출금 내역"
          description={`현재 검색 조건에 맞는 내역 ${result.transactions.length.toLocaleString("ko-KR")}건입니다.`}
          action={
            <>
              <a href={exportHref} className="button-secondary w-full sm:w-auto">
                <span aria-hidden="true" className="text-lg leading-none">↓</span>
                엑셀 다운로드
              </a>
              <Link href="/transactions/new" className="button-primary w-full sm:w-auto">
                <span aria-hidden="true" className="text-xl leading-none">+</span>
                새 내역 등록
              </Link>
            </>
          }
        />

        <TransactionSearchForm key={searchFormKey} categories={categories} condition={condition} />
        <TransactionSummary
          totalIncome={result.totalIncome}
          totalExpense={result.totalExpense}
          balance={result.balance}
        />
        <TransactionTable transactions={result.transactions} />
      </section>
    </AppShell>
  );
}
