"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { requireFreshUser } from "@/features/auth/queries/require-fresh-user";
import {
  isCategoryTypeCompatible,
  parsePositiveSafeInteger,
  parseTransactionAmount,
  parseTransactionDate,
  parseTransactionType,
} from "../utils/transaction-validation";

type CategoryQueryExecutor = Pick<typeof db, "select">;

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseTransactionForm(formData: FormData) {
  const transactionDate = parseTransactionDate(getRequiredString(formData, "transactionDate"));
  const type = parseTransactionType(getRequiredString(formData, "type"));
  const categoryId = parsePositiveSafeInteger(
    getRequiredString(formData, "categoryId"),
    "카테고리",
  );
  const title = getRequiredString(formData, "title");
  const amount = parseTransactionAmount(getRequiredString(formData, "amount"));
  const memo = getRequiredString(formData, "memo") || null;
  const paymentMethod = getRequiredString(formData, "paymentMethod") || null;

  if (!title) {
    throw new Error("내용을 입력해주세요.");
  }

  return {
    transactionDate,
    type,
    categoryId,
    title,
    amount,
    memo,
    paymentMethod,
  };
}

async function assertUserCategory(
  executor: CategoryQueryExecutor,
  userId: string,
  categoryId: number,
  transactionType: "INCOME" | "EXPENSE",
  allowInactiveCategoryId?: number,
) {
  // Serialize category state/type changes with the transaction write.
  const [category] = await executor
    .select({
      id: categories.id,
      type: categories.type,
      isActive: categories.isActive,
    })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .for("update")
    .limit(1);

  if (!category) {
    throw new Error("선택한 카테고리를 사용할 수 없습니다.");
  }

  if (!isCategoryTypeCompatible(category.type, transactionType)) {
    throw new Error("입금·출금 구분에 맞는 카테고리를 선택해주세요.");
  }

  if (!category.isActive && category.id !== allowInactiveCategoryId) {
    throw new Error("사용 중지된 카테고리는 새 내역에 선택할 수 없습니다.");
  }
}

export async function createTransaction(formData: FormData) {
  const user = await requireFreshUser();

  const values = parseTransactionForm(formData);
  const intent = getRequiredString(formData, "intent");

  await db.transaction(async (tx) => {
    await assertUserCategory(tx, user.id, values.categoryId, values.type);
    await tx.insert(transactions).values({ ...values, userId: user.id });
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  if (intent === "continue") {
    redirect("/transactions/new?saved=1");
  }

  redirect("/transactions");
}

export async function updateTransaction(formData: FormData) {
  const user = await requireFreshUser();

  const id = parsePositiveSafeInteger(getRequiredString(formData, "id"), "거래");

  const values = parseTransactionForm(formData);
  await db.transaction(async (tx) => {
    const [existingTransaction] = await tx
      .select({ categoryId: transactions.categoryId })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
      .for("update")
      .limit(1);

    if (!existingTransaction) {
      throw new Error("수정할 거래를 찾을 수 없습니다.");
    }

    await assertUserCategory(
      tx,
      user.id,
      values.categoryId,
      values.type,
      existingTransaction.categoryId,
    );

    await tx
      .update(transactions)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);

  redirect("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  const user = await requireFreshUser();

  const id = parsePositiveSafeInteger(getRequiredString(formData, "id"), "거래");

  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}
