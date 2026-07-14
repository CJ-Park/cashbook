import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import type {
  TransactionCursor,
  TransactionPage,
  TransactionSearchCondition,
  TransactionSearchResult,
} from "../types";
import { buildTransactionConditions } from "./search-conditions";

export const TRANSACTION_PAGE_SIZE = 20;

const transactionSelection = {
  id: transactions.id,
  transactionDate: transactions.transactionDate,
  type: transactions.type,
  categoryId: transactions.categoryId,
  categoryName: categories.name,
  title: transactions.title,
  amount: transactions.amount,
  memo: transactions.memo,
  paymentMethod: transactions.paymentMethod,
  createdAt: transactions.createdAt,
};

async function getTransactionSummary(
  userId: string,
  condition: TransactionSearchCondition,
) {
  const where = buildTransactionConditions(userId, condition);
  const [summary] = await db
    .select({
      totalCount: sql<string>`count(*)`,
      totalIncome:
        sql<string>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount} else 0 end), 0)`,
      totalExpense:
        sql<string>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount} else 0 end), 0)`,
    })
    .from(transactions)
    .where(where);

  return {
    totalCount: Number(summary?.totalCount ?? 0),
    totalIncome: BigInt(summary?.totalIncome ?? "0"),
    totalExpense: BigInt(summary?.totalExpense ?? "0"),
  };
}

export async function getTransactionPage(
  userId: string,
  condition: TransactionSearchCondition,
  cursor?: TransactionCursor,
): Promise<TransactionPage> {
  if (condition.validationError) {
    return { transactions: [], nextCursor: null };
  }

  const where = buildTransactionConditions(userId, condition);
  const cursorCondition = cursor
    ? sql`(${transactions.transactionDate} < ${cursor.transactionDate} or (${transactions.transactionDate} = ${cursor.transactionDate} and ${transactions.id} < ${cursor.id}))`
    : undefined;
  const rows = await db
    .select(transactionSelection)
    .from(transactions)
    .innerJoin(
      categories,
      and(eq(transactions.categoryId, categories.id), eq(categories.userId, userId)),
    )
    .where(cursorCondition ? and(where, cursorCondition) : where)
    .orderBy(desc(transactions.transactionDate), desc(transactions.id))
    .limit(TRANSACTION_PAGE_SIZE + 1);

  const hasMore = rows.length > TRANSACTION_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, TRANSACTION_PAGE_SIZE) : rows;
  const lastRow = pageRows.at(-1);

  return {
    transactions: pageRows,
    nextCursor:
      hasMore && lastRow
        ? { transactionDate: lastRow.transactionDate, id: lastRow.id }
        : null,
  };
}

export async function getTransactions(
  userId: string,
  condition: TransactionSearchCondition,
): Promise<TransactionSearchResult> {
  if (condition.validationError) {
    const zeroAmount = BigInt(0);

    return {
      transactions: [],
      nextCursor: null,
      totalCount: 0,
      totalIncome: zeroAmount,
      totalExpense: zeroAmount,
      balance: zeroAmount,
    };
  }

  const [summary, page] = await Promise.all([
    getTransactionSummary(userId, condition),
    getTransactionPage(userId, condition),
  ]);

  return {
    ...page,
    ...summary,
    balance: summary.totalIncome - summary.totalExpense,
  };
}

export async function getTransactionsForExport(
  userId: string,
  condition: TransactionSearchCondition,
) {
  return db
    .select(transactionSelection)
    .from(transactions)
    .innerJoin(
      categories,
      and(eq(transactions.categoryId, categories.id), eq(categories.userId, userId)),
    )
    .where(buildTransactionConditions(userId, condition))
    .orderBy(desc(transactions.transactionDate), desc(transactions.id));
}
