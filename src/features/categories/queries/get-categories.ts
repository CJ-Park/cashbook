import { and, asc, count, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";

const defaultCategories: Array<{
  name: string;
  type: "INCOME" | "EXPENSE";
  sortOrder: number;
}> = [
  { name: "판매수입", type: "INCOME", sortOrder: 10 },
  { name: "계좌이체", type: "INCOME", sortOrder: 20 },
  { name: "현금입금", type: "INCOME", sortOrder: 30 },
  { name: "환불", type: "INCOME", sortOrder: 40 },
  { name: "기타입금", type: "INCOME", sortOrder: 50 },
  { name: "재료비", type: "EXPENSE", sortOrder: 10 },
  { name: "택배비", type: "EXPENSE", sortOrder: 20 },
  { name: "임대료", type: "EXPENSE", sortOrder: 30 },
  { name: "인건비", type: "EXPENSE", sortOrder: 40 },
  { name: "광고비", type: "EXPENSE", sortOrder: 50 },
  { name: "식비", type: "EXPENSE", sortOrder: 60 },
  { name: "교통비", type: "EXPENSE", sortOrder: 70 },
  { name: "소모품비", type: "EXPENSE", sortOrder: 80 },
  { name: "통신비", type: "EXPENSE", sortOrder: 90 },
  { name: "세금", type: "EXPENSE", sortOrder: 100 },
  { name: "기타출금", type: "EXPENSE", sortOrder: 110 },
];

export async function ensureDefaultCategoriesForUser(userId: string) {
  await db
    .insert(categories)
    .values(defaultCategories.map((category) => ({ ...category, userId })))
    .onConflictDoNothing({
      target: [categories.userId, categories.name, categories.type],
    });
}

export async function getCategories(userId: string) {
  await ensureDefaultCategoriesForUser(userId);

  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoriesWithTransactionCount(userId: string) {
  await ensureDefaultCategoriesForUser(userId);

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
    .leftJoin(
      transactions,
      and(eq(categories.id, transactions.categoryId), eq(transactions.userId, userId)),
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveCategories(userId: string) {
  await ensureDefaultCategoriesForUser(userId);

  return db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.isActive, true)))
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveCategoriesForTransactionType(
  userId: string,
  type: "INCOME" | "EXPENSE",
) {
  await ensureDefaultCategoriesForUser(userId);

  return db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.isActive, true),
        or(eq(categories.type, type), eq(categories.type, "COMMON")),
      ),
    )
    .orderBy(asc(categories.type), asc(categories.sortOrder), asc(categories.name));
}
