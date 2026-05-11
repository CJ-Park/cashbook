import { and, asc, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories } from "@/db/schema";

export async function getCategories() {
  return db
    .select()
    .from(categories)
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
