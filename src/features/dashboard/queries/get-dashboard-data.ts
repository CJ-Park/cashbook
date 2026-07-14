import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { formatMonthLabel, getKoreaMonthRange } from "@/shared/utils/format";

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
  totalIncome: bigint;
  totalExpense: bigint;
  balance: bigint;
  recentTransactions: DashboardTransaction[];
};

export async function getDashboardData(userId: string, now = new Date()): Promise<DashboardData> {
  const { startDate, endDate } = getKoreaMonthRange(now);

  const monthlySummary = db.$with("monthly_summary").as(
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
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lt(transactions.transactionDate, endDate),
        ),
      ),
  );

  const recent = db.$with("recent_transactions").as(
    db
      .select({
        id: transactions.id,
        transactionDate: transactions.transactionDate,
        type: transactions.type,
        categoryName: categories.name,
        title: transactions.title,
        amount: transactions.amount,
      })
      .from(transactions)
      .innerJoin(
        categories,
        and(eq(transactions.categoryId, categories.id), eq(categories.userId, userId)),
      )
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate), desc(transactions.id))
      .limit(10),
  );

  const rows = await db
    .with(monthlySummary, recent)
    .select({
      summary: {
        totalIncome: monthlySummary.totalIncome,
        totalExpense: monthlySummary.totalExpense,
      },
      transaction: {
        id: recent.id,
        transactionDate: recent.transactionDate,
        type: recent.type,
        categoryName: recent.categoryName,
        title: recent.title,
        amount: recent.amount,
      },
    })
    .from(monthlySummary)
    .leftJoin(recent, sql`true`)
    .orderBy(desc(recent.transactionDate), desc(recent.id));

  const summary = rows[0]?.summary;
  const recentTransactions = rows.flatMap(({ transaction }) =>
    transaction ? [transaction] : [],
  );

  const totalIncome = BigInt(summary?.totalIncome ?? "0");
  const totalExpense = BigInt(summary?.totalExpense ?? "0");

  return {
    monthLabel: formatMonthLabel(now),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    recentTransactions,
  };
}
