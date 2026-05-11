import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import type { TransactionSearchCondition, TransactionSearchResult } from "../types";
import { buildTransactionConditions } from "./search-conditions";

export async function getTransactions(
  userId: string,
  condition: TransactionSearchCondition,
): Promise<TransactionSearchResult> {
  const where = buildTransactionConditions(userId, condition);

  const rows = await db
    .select({
      id: transactions.id,
      transactionDate: transactions.transactionDate,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      title: transactions.title,
      amount: transactions.amount,
      memo: transactions.memo,
      paymentMethod: transactions.paymentMethod,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(where)
    .orderBy(desc(transactions.transactionDate), desc(transactions.id));

  const [summary] = await db
    .select({
      totalIncome: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount} else 0 end), 0)::int`,
      totalExpense: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount} else 0 end), 0)::int`,
    })
    .from(transactions)
    .where(where);

  const totalIncome = Number(summary?.totalIncome ?? 0);
  const totalExpense = Number(summary?.totalExpense ?? 0);

  return {
    transactions: rows,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
