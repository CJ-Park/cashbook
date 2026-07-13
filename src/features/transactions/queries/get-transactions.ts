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

  const summary = db.$with("transaction_summary").as(
    db
      .select({
        totalIncome:
          sql<string>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount} else 0 end), 0)`.as(
            "total_income",
          ),
        totalExpense:
          sql<string>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount} else 0 end), 0)`.as(
            "total_expense",
          ),
      })
      .from(transactions)
      .where(where),
  );

  const transactionRows = db.$with("transaction_rows").as(
    db
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
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where),
  );

  const rows = await db
    .with(summary, transactionRows)
    .select({
      summary: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
      },
      transaction: {
        id: transactionRows.id,
        transactionDate: transactionRows.transactionDate,
        type: transactionRows.type,
        categoryId: transactionRows.categoryId,
        categoryName: transactionRows.categoryName,
        title: transactionRows.title,
        amount: transactionRows.amount,
        memo: transactionRows.memo,
        paymentMethod: transactionRows.paymentMethod,
        createdAt: transactionRows.createdAt,
      },
    })
    .from(summary)
    .leftJoin(transactionRows, sql`true`)
    .orderBy(desc(transactionRows.transactionDate), desc(transactionRows.id));

  const summaryRow = rows[0]?.summary;
  const resultRows = rows.flatMap(({ transaction }) => (transaction ? [transaction] : []));

  const totalIncome = Number(summaryRow?.totalIncome ?? 0);
  const totalExpense = Number(summaryRow?.totalExpense ?? 0);

  return {
    transactions: resultRows,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
