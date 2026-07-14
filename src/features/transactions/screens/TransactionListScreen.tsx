import Link from "next/link";
import type { Category } from "@/db/schema";
import { AppShell } from "@/shared/components/layout/AppShell";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { validateTransactionExportPeriod } from "../export/validate-export-period";
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
  const exportPeriod = validateTransactionExportPeriod(condition.startDate, condition.endDate);
  const transactionListKey = `${searchFormKey}|${result.totalCount}|${result.transactions
    .map((transaction) => transaction.id)
    .join(",")}`;

  return (
    <AppShell activeSection="transactions">
      <section className="flex w-full flex-col gap-6 lg:gap-7">
        <PageHeader
          eyebrow="TRANSACTIONS"
          title="입출금 내역"
          description={`현재 검색 조건에 맞는 내역 ${result.totalCount.toLocaleString("ko-KR")}건입니다.`}
          action={
            <>
              {exportPeriod.isValid ? (
                <a href={exportHref} className="button-secondary w-full sm:w-auto">
                  <span aria-hidden="true" className="text-lg leading-none">↓</span>
                  엑셀 다운로드
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  title={exportPeriod.message}
                  className="button-secondary w-full cursor-not-allowed opacity-55 sm:w-auto"
                >
                  <span aria-hidden="true" className="text-lg leading-none">↓</span>
                  엑셀 다운로드
                </span>
              )}
              <Link href="/transactions/new" className="button-primary w-full sm:w-auto">
                <span aria-hidden="true" className="text-xl leading-none">+</span>
                새 내역 등록
              </Link>
            </>
          }
        />

        <TransactionSearchForm key={searchFormKey} categories={categories} condition={condition} />
        {condition.validationError ? (
          <p
            role="alert"
            className="rounded-2xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-bold text-[var(--danger)]"
          >
            {condition.validationError} 날짜를 다시 확인해주세요.
          </p>
        ) : null}
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            exportPeriod.isValid
              ? "bg-[var(--primary-soft)] text-[var(--primary)]"
              : "bg-[var(--warning-soft)] text-[var(--warning)]"
          }`}
        >
          <span aria-hidden="true">ⓘ </span>
          {exportPeriod.message}
          {!exportPeriod.isValid ? " 날짜를 입력한 뒤 검색하기를 눌러주세요." : ""}
        </p>
        <TransactionSummary
          totalIncome={result.totalIncome}
          totalExpense={result.totalExpense}
          balance={result.balance}
        />
        <TransactionTable
          key={transactionListKey}
          initialTransactions={result.transactions}
          initialCursor={result.nextCursor}
          searchParams={exportSearchParams}
          totalCount={result.totalCount}
        />
      </section>
    </AppShell>
  );
}
