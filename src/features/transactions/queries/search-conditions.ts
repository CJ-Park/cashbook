import { and, eq, gte, ilike, lte, or, type SQL } from "drizzle-orm";
import { transactions } from "@/db/schema";
import type { TransactionSearchCondition } from "../types";

export function parseTransactionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): TransactionSearchCondition {
  const getValue = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const type = getValue("type");
  const categoryId = Number(getValue("categoryId"));

  return {
    startDate: getValue("startDate") || undefined,
    endDate: getValue("endDate") || undefined,
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined,
    keyword: getValue("keyword")?.trim() || undefined,
  };
}

export function buildTransactionConditions(userId: string, condition: TransactionSearchCondition) {
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

  if (condition.categoryId) {
    conditions.push(eq(transactions.categoryId, condition.categoryId));
  }

  if (condition.keyword) {
    const keyword = `%${condition.keyword}%`;
    const keywordCondition = or(ilike(transactions.title, keyword), ilike(transactions.memo, keyword));

    if (keywordCondition) {
      conditions.push(keywordCondition);
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
