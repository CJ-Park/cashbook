import Link from "next/link";
import { TypeBadge } from "@/shared/components/ui/TypeBadge";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { deleteTransaction } from "../actions/transaction-actions";
import type { TransactionRow } from "../types";
import { DeleteTransactionButton } from "./DeleteTransactionButton";

type TransactionTableProps = {
  transactions: TransactionRow[];
};

function amountColor(type: TransactionRow["type"]) {
  return type === "INCOME" ? "text-income" : "text-expense";
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="surface-card px-5 py-12 text-center sm:py-16">
        <span
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-2xl"
        >
          ↗
        </span>
        <h2 className="mt-4 text-xl font-black text-[var(--text)]">검색 결과가 없습니다</h2>
        <p className="mt-2 text-base text-[var(--text-soft)]">검색 조건을 바꾸거나 새 내역을 등록해보세요.</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/transactions" className="button-secondary w-full sm:w-auto">
            검색 초기화
          </Link>
          <Link href="/transactions/new" className="button-primary w-full sm:w-auto">
            새 내역 등록
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="transaction-result-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="transaction-result-heading" className="text-xl font-black tracking-[-0.025em] text-[var(--text)]">
            거래 목록
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            최신 날짜순으로 {transactions.length.toLocaleString("ko-KR")}건을 보여드려요.
          </p>
        </div>
      </div>

      <div className="space-y-3 xl:hidden">
        {transactions.map((transaction) => (
          <article key={transaction.id} className="surface-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <time
                dateTime={transaction.transactionDate}
                className="text-sm font-extrabold text-[var(--text-soft)]"
              >
                {formatDate(transaction.transactionDate)}
              </time>
              <TypeBadge type={transaction.type} compact />
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-lg leading-7 font-black text-[var(--text)]">
                  {transaction.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--text-soft)]">
                  <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1">
                    {transaction.categoryName}
                  </span>
                  {transaction.paymentMethod ? (
                    <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[var(--primary)]">
                      {transaction.paymentMethod}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className={`money max-w-[48%] break-words text-right text-xl font-black sm:text-2xl ${amountColor(transaction.type)}`}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            {transaction.memo ? (
              <p className="mt-4 rounded-xl bg-[var(--surface-soft)] px-3.5 py-3 text-sm leading-6 text-[var(--text-soft)]">
                {transaction.memo}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href={`/transactions/${transaction.id}/edit`}
                className="button-secondary min-h-11 px-3 py-2 text-sm"
              >
                수정
              </Link>
              <DeleteTransactionButton id={transaction.id} action={deleteTransaction} />
            </div>
          </article>
        ))}
      </div>

      <div className="surface-card scrollbar-subtle hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <caption className="sr-only">검색 조건에 맞는 입출금 거래 목록</caption>
          <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-sm font-extrabold text-[var(--text-soft)]">
            <tr>
              <th scope="col" className="px-5 py-3.5">날짜</th>
              <th scope="col" className="px-4 py-3.5">구분</th>
              <th scope="col" className="px-4 py-3.5">카테고리</th>
              <th scope="col" className="px-4 py-3.5">내용</th>
              <th scope="col" className="px-4 py-3.5 text-right">금액</th>
              <th scope="col" className="px-4 py-3.5">메모·결제수단</th>
              <th scope="col" className="px-5 py-3.5 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="transition hover:bg-[var(--surface-soft)]">
                <td className="whitespace-nowrap px-5 py-4 font-bold text-[var(--text-soft)]">
                  {formatDate(transaction.transactionDate)}
                </td>
                <td className="px-4 py-4">
                  <TypeBadge type={transaction.type} compact />
                </td>
                <td className="px-4 py-4 font-bold text-[var(--text-soft)]">{transaction.categoryName}</td>
                <td className="max-w-56 px-4 py-4 font-extrabold text-[var(--text)]">
                  <p className="truncate" title={transaction.title}>{transaction.title}</p>
                </td>
                <td className={`money whitespace-nowrap px-4 py-4 text-right text-lg font-black ${amountColor(transaction.type)}`}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="max-w-64 px-4 py-4">
                  <p className="truncate text-sm text-[var(--text-soft)]" title={transaction.memo ?? undefined}>
                    {transaction.memo || "메모 없음"}
                  </p>
                  {transaction.paymentMethod ? (
                    <p className="mt-1 text-xs font-extrabold text-[var(--primary)]">{transaction.paymentMethod}</p>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/transactions/${transaction.id}/edit`}
                      className="button-secondary min-h-11 px-3 py-2 text-sm"
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
    </section>
  );
}
