import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import type { MonthlyReportRow } from "../types";

export async function getMonthlyReport(userId: string, year: number): Promise<MonthlyReportRow[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year + 1}-01-01`;
  const month = sql<number>`extract(month from ${transactions.transactionDate})::int`;

  const rows = await db
    .select({
      month,
      totalIncome: sql<number>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount} else 0 end), 0)::int`,
      totalExpense: sql<number>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount} else 0 end), 0)::int`,
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.transactionDate, startDate),
        lt(transactions.transactionDate, endDate),
        eq(transactions.userId, userId),
      ),
    )
    .groupBy(month);

  const byMonth = new Map(rows.map((row) => [Number(row.month), row]));

  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const row = byMonth.get(monthNumber);
    const totalIncome = Number(row?.totalIncome ?? 0);
    const totalExpense = Number(row?.totalExpense ?? 0);

    return {
      month: monthNumber,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  });
}
