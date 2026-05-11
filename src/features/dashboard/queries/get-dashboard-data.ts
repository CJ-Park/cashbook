import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { toDateInputValue } from "@/shared/utils/format";

export type DashboardTransaction = {
  id: number;
  transactionDate: string;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  title: string;
  amount: number;
};

export type DashboardData = {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: DashboardTransaction[];
};

function getMonthRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export async function getDashboardData(now = new Date()): Promise<DashboardData> {
  const { startDate, endDate } = getMonthRange(now);

  const [summary] = await db
    .select({
      totalIncome: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount} else 0 end), 0)::int`,
      totalExpense: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount} else 0 end), 0)::int`,
    })
    .from(transactions)
    .where(and(gte(transactions.transactionDate, startDate), lt(transactions.transactionDate, endDate)));

  const recentTransactions = await db
    .select({
      id: transactions.id,
      transactionDate: transactions.transactionDate,
      type: transactions.type,
      categoryName: categories.name,
      title: transactions.title,
      amount: transactions.amount,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.transactionDate), desc(transactions.id))
    .limit(10);

  const totalIncome = Number(summary?.totalIncome ?? 0);
  const totalExpense = Number(summary?.totalExpense ?? 0);

  return {
    monthLabel: `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions,
  };
}
