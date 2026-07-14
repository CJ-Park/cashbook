import { SummaryCard } from "@/shared/components/ui/SummaryCard";
import { formatCurrency } from "@/shared/utils/format";

type TransactionSummaryProps = {
  totalIncome: bigint;
  totalExpense: bigint;
  balance: bigint;
};

export function TransactionSummary({ totalIncome, totalExpense, balance }: TransactionSummaryProps) {
  return (
    <section aria-label="검색 결과 합계" className="grid gap-3 sm:grid-cols-3 lg:gap-4">
      <SummaryCard label="입금 합계" value={formatCurrency(totalIncome)} tone="income" hint="검색 결과 기준" />
      <SummaryCard label="출금 합계" value={formatCurrency(totalExpense)} tone="expense" hint="검색 결과 기준" />
      <SummaryCard label="차액" value={formatCurrency(balance)} tone="balance" hint="입금 - 출금" />
    </section>
  );
}
