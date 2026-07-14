import { and, eq, gte, lte, or, sql, type SQL } from "drizzle-orm";
import { transactions } from "@/db/schema";
import { isValidDateInput, validateOptionalDateRange } from "@/shared/utils/date";
import type { TransactionSearchCondition } from "../types";

export const isValidTransactionSearchDate = isValidDateInput;

export function escapeLikePattern(value: string) {
  return value.replaceAll("!", "!!").replaceAll("%", "!%").replaceAll("_", "!_");
}

function parseDate(value?: string) {
  if (!value || !isValidDateInput(value)) {
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
  const rawStartDate = getValue("startDate") || undefined;
  const rawEndDate = getValue("endDate") || undefined;
  const startDate = parseDate(rawStartDate);
  const endDate = parseDate(rawEndDate);

  return {
    startDate,
    endDate,
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    categoryId:
      Number.isSafeInteger(categoryId) && categoryId > 0 ? categoryId : undefined,
    keyword: getValue("keyword")?.trim() || undefined,
    validationError: validateOptionalDateRange(rawStartDate, rawEndDate) ?? undefined,
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
    const keyword = `%${escapeLikePattern(condition.keyword)}%`;
    const keywordCondition = or(
      sql`${transactions.title} ilike ${keyword} escape '!'`,
      sql`${transactions.memo} ilike ${keyword} escape '!'`,
    );

    if (keywordCondition) {
      conditions.push(keywordCondition);
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
