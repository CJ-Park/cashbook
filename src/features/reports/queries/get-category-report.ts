import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { isValidDateInput, validateOptionalDateRange } from "@/shared/utils/date";
import type { CategoryReportCondition, CategoryReportRow } from "../types";

export function parseCategoryReportParams(
  searchParams: Record<string, string | string[] | undefined>,
): CategoryReportCondition {
  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const type = getValue("type");
  const rawStartDate = getValue("startDate") || undefined;
  const rawEndDate = getValue("endDate") || undefined;

  return {
    startDate: rawStartDate && isValidDateInput(rawStartDate) ? rawStartDate : undefined,
    endDate: rawEndDate && isValidDateInput(rawEndDate) ? rawEndDate : undefined,
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    validationError: validateOptionalDateRange(rawStartDate, rawEndDate) ?? undefined,
  };
}

export async function getCategoryReport(
  userId: string,
  condition: CategoryReportCondition,
): Promise<CategoryReportRow[]> {
  if (condition.validationError) {
    return [];
  }

  const conditions: SQL[] = [eq(transactions.userId, userId)];

  if (condition.startDate) {
    conditions.push(gte(transactions.transactionDate, condition.startDate));
  }

  if (condition.endDate) {
    conditions.push(lte(transactions.transactionDate, condition.endDate));
  }

  if (condition.type) {
    conditions.push(eq(transactions.type, condition.type));
  }

  const totalAmount = sql<string>`coalesce(sum(${transactions.amount}), 0)`;

  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryType: categories.type,
      totalAmount,
    })
    .from(transactions)
    .innerJoin(
      categories,
      and(eq(transactions.categoryId, categories.id), eq(categories.userId, userId)),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(categories.id)
    .orderBy(desc(totalAmount));

  return rows.map((row) => ({
    ...row,
    totalAmount: BigInt(row.totalAmount),
  }));
}
