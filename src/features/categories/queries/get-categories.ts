import { and, asc, count, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoriesWithTransactionCount() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      transactionCount: count(transactions.id),
    })
    .from(categories)
    .leftJoin(transactions, eq(categories.id, transactions.categoryId))
    .groupBy(categories.id)
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveCategoriesForTransactionType(type: "INCOME" | "EXPENSE") {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), or(eq(categories.type, type), eq(categories.type, "COMMON"))))
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}
