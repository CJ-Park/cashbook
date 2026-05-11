import Link from "next/link";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { deleteTransaction } from "../actions/transaction-actions";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import type { TransactionRow } from "../types";

type TransactionTableProps = {
  transactions: TransactionRow[];
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-zinc-700">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead className="bg-zinc-100 text-sm font-semibold text-zinc-600">
          <tr>
            <th className="px-4 py-3">날짜</th>
            <th className="px-4 py-3">구분</th>
            <th className="px-4 py-3">카테고리</th>
            <th className="px-4 py-3">내용</th>
            <th className="px-4 py-3 text-right">금액</th>
            <th className="px-4 py-3">메모</th>
            <th className="px-4 py-3">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-4 py-4 text-zinc-700">{formatDate(transaction.transactionDate)}</td>
              <td className="px-4 py-4 font-semibold text-zinc-900">
                {transaction.type === "INCOME" ? "입금" : "출금"}
              </td>
              <td className="px-4 py-4 text-zinc-700">{transaction.categoryName}</td>
              <td className="px-4 py-4 text-zinc-950">{transaction.title}</td>
              <td className="px-4 py-4 text-right font-bold text-zinc-950">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-4 py-4 text-zinc-700">{transaction.memo ?? ""}</td>
              <td className="px-4 py-4">
                <div className="flex gap-3">
                  <Link
                    href={`/transactions/${transaction.id}/edit`}
                    className="font-semibold text-zinc-900 hover:text-zinc-600"
                  >
                    수정
                  </Link>
                  <DeleteTransactionButton id={transaction.id} action={deleteTransaction} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
