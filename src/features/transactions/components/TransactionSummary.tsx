import { formatCurrency } from "@/shared/utils/format";

type TransactionSummaryProps = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function TransactionSummary({ totalIncome, totalExpense, balance }: TransactionSummaryProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <SummaryItem label="검색 결과 입금 합계" value={formatCurrency(totalIncome)} />
      <SummaryItem label="검색 결과 출금 합계" value={formatCurrency(totalExpense)} />
      <SummaryItem label="검색 결과 차액" value={formatCurrency(balance)} />
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}
