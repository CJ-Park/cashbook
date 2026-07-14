"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TypeBadge } from "@/shared/components/ui/TypeBadge";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { deleteTransaction } from "../actions/transaction-actions";
import type { TransactionCursor, TransactionRow } from "../types";
import { DeleteTransactionButton } from "./DeleteTransactionButton";

type TransactionTableProps = {
  initialTransactions: TransactionRow[];
  initialCursor: TransactionCursor | null;
  searchParams: string;
  totalCount: number;
};

type TransactionPageResponse = {
  transactions: Array<Omit<TransactionRow, "createdAt"> & { createdAt: string }>;
  nextCursor: TransactionCursor | null;
};

function amountColor(type: TransactionRow["type"]) {
  return type === "INCOME" ? "text-income" : "text-expense";
}

function deserializeTransaction(
  transaction: TransactionPageResponse["transactions"][number],
): TransactionRow {
  return {
    ...transaction,
    createdAt: new Date(transaction.createdAt),
  };
}

export function TransactionTable({
  initialTransactions,
  initialCursor,
  searchParams,
  totalCount,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const loadedIdsRef = useRef(new Set(initialTransactions.map((transaction) => transaction.id)));

  const loadMore = useCallback(async () => {
    if (!cursor || loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(searchParams);
      params.set("cursorDate", cursor.transactionDate);
      params.set("cursorId", String(cursor.id));
      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      if (response.status === 401) {
        const nextPath = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load transaction page.");
      }

      const page = (await response.json()) as TransactionPageResponse;
      const nextTransactions = page.transactions
        .map(deserializeTransaction)
        .filter((transaction) => !loadedIdsRef.current.has(transaction.id));

      nextTransactions.forEach((transaction) => loadedIdsRef.current.add(transaction.id));
      setTransactions((currentTransactions) => [...currentTransactions, ...nextTransactions]);
      setAnnouncement(
        `${nextTransactions.length.toLocaleString("ko-KR")}건을 더 불러왔습니다. 현재 ${loadedIdsRef.current.size.toLocaleString("ko-KR")}건입니다.`,
      );
      setCursor(page.nextCursor);
    } catch {
      setError("내역을 더 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [cursor, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !cursor || error) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [cursor, error, loadMore]);

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
            전체 {totalCount.toLocaleString("ko-KR")}건 중 {transactions.length.toLocaleString("ko-KR")}건을 불러왔어요.
          </p>
        </div>
      </div>

      <div className="xl:overflow-hidden xl:rounded-[1.25rem] xl:border xl:border-[var(--border)] xl:bg-[var(--surface)] xl:shadow-[var(--shadow-sm)]">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[7rem_5rem_minmax(7rem,0.8fr)_minmax(12rem,1.5fr)_minmax(8.5rem,0.8fr)_minmax(10rem,1fr)_9rem] gap-4 bg-[var(--surface-soft)] px-5 py-3.5 text-sm font-extrabold text-[var(--text-soft)] xl:grid"
        >
          <span>날짜</span>
          <span>구분</span>
          <span>카테고리</span>
          <span>내용</span>
          <span className="text-right">금액</span>
          <span>메모·결제수단</span>
          <span className="text-right">관리</span>
        </div>

        <ol className="m-0 list-none space-y-3 p-0 xl:divide-y xl:divide-[var(--border)] xl:space-y-0">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <article className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-soft)] sm:p-5 xl:grid xl:grid-cols-[7rem_5rem_minmax(7rem,0.8fr)_minmax(12rem,1.5fr)_minmax(8.5rem,0.8fr)_minmax(10rem,1fr)_9rem] xl:items-center xl:gap-4 xl:rounded-none xl:border-0 xl:px-5 xl:py-4 xl:shadow-none">
                <div className="flex items-center justify-between gap-3 xl:contents">
                  <time
                    dateTime={transaction.transactionDate}
                    className="whitespace-nowrap text-sm font-extrabold text-[var(--text-soft)]"
                  >
                    <span className="sr-only">날짜: </span>
                    {formatDate(transaction.transactionDate)}
                  </time>
                  <div>
                    <span className="sr-only">구분: </span>
                    <TypeBadge type={transaction.type} compact />
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold text-[var(--text-soft)] xl:mt-0">
                  <span className="sr-only">카테고리: </span>
                  <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-2.5 py-1 xl:bg-transparent xl:p-0">
                    {transaction.categoryName}
                  </span>
                </p>

                <div className="mt-3 flex items-start justify-between gap-4 xl:contents">
                  <h3 className="min-w-0 break-words text-lg leading-7 font-black text-[var(--text)] xl:truncate xl:text-base" title={transaction.title}>
                    <span className="sr-only">내용: </span>
                    {transaction.title}
                  </h3>
                  <p className={`money max-w-[48%] break-words text-right text-xl font-black sm:text-2xl xl:max-w-none xl:whitespace-nowrap xl:text-lg ${amountColor(transaction.type)}`}>
                    <span className="sr-only">금액: </span>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-[var(--surface-soft)] px-3.5 py-3 text-sm leading-6 text-[var(--text-soft)] xl:mt-0 xl:min-w-0 xl:bg-transparent xl:p-0">
                  <p className="break-words xl:truncate" title={transaction.memo ?? undefined}>
                    <span className="sr-only">메모: </span>
                    {transaction.memo || "메모 없음"}
                  </p>
                  {transaction.paymentMethod ? (
                    <p className="mt-1 font-extrabold text-[var(--primary)] xl:text-xs">
                      <span className="sr-only">결제수단: </span>
                      {transaction.paymentMethod}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4 xl:mt-0 xl:flex xl:justify-end xl:border-0 xl:pt-0">
                  <Link
                    href={`/transactions/${transaction.id}/edit`}
                    className="button-secondary min-h-11 px-3 py-2 text-sm"
                  >
                    수정
                  </Link>
                  <DeleteTransactionButton id={transaction.id} action={deleteTransaction} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <div
        ref={sentinelRef}
        className="flex min-h-20 items-center justify-center px-4 py-5 text-center text-sm font-bold text-[var(--text-soft)]"
        aria-live="polite"
      >
        {error ? (
          <div role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="button-secondary mt-3 min-h-11 px-4 py-2 text-sm"
              onClick={() => void loadMore()}
            >
              다시 시도
            </button>
          </div>
        ) : cursor ? (
          <p>
            {isLoading
              ? "내역을 더 불러오는 중입니다…"
              : announcement || "아래로 내리면 내역을 더 불러옵니다."}
          </p>
        ) : (
          <p>
            검색된 내역을 모두 불러왔습니다. 현재 {transactions.length.toLocaleString("ko-KR")}건입니다.
          </p>
        )}
      </div>
    </section>
  );
}
