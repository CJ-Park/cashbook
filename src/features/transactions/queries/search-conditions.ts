import { and, eq, gte, ilike, lte, or, type SQL } from "drizzle-orm";
import { transactions } from "@/db/schema";
import type { TransactionSearchCondition } from "../types";

export function isValidTransactionSearchDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseDate(value?: string) {
  if (!value || !isValidTransactionSearchDate(value)) {
    return undefined;
  }

  return value;
}

export function parseTransactionSearchParams(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams,
): TransactionSearchCondition {
  const getValue = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }

    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const type = getValue("type");
  const categoryId = Number(getValue("categoryId"));

  return {
    startDate: parseDate(getValue("startDate")),
    endDate: parseDate(getValue("endDate")),
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined,
    keyword: getValue("keyword")?.trim() || undefined,
  };
}

export function createTransactionSearchParams(condition: TransactionSearchCondition) {
  const searchParams = new URLSearchParams();

  if (condition.startDate) {
    searchParams.set("startDate", condition.startDate);
  }

  if (condition.endDate) {
    searchParams.set("endDate", condition.endDate);
  }

  if (condition.type) {
    searchParams.set("type", condition.type);
  }

  if (condition.categoryId) {
    searchParams.set("categoryId", String(condition.categoryId));
  }

  if (condition.keyword) {
    searchParams.set("keyword", condition.keyword);
  }

  return searchParams;
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
