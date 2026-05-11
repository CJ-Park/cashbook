import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import type { CategoryReportCondition, CategoryReportRow } from "../types";

export function parseCategoryReportParams(
  searchParams: Record<string, string | string[] | undefined>,
): CategoryReportCondition {
  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const type = getValue("type");

  return {
    startDate: getValue("startDate") || undefined,
    endDate: getValue("endDate") || undefined,
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
  };
}

export async function getCategoryReport(
  condition: CategoryReportCondition,
): Promise<CategoryReportRow[]> {
  const conditions: SQL[] = [];

  if (condition.startDate) {
    conditions.push(gte(transactions.transactionDate, condition.startDate));
  }

  if (condition.endDate) {
    conditions.push(lte(transactions.transactionDate, condition.endDate));
  }

  if (condition.type) {
    conditions.push(eq(transactions.type, condition.type));
  }

  const totalAmount = sql<number>`coalesce(sum(${transactions.amount}), 0)::int`;

  return db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryType: categories.type,
      totalAmount,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(categories.id)
    .orderBy(desc(totalAmount));
}
