"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";
import { requireUser } from "@/features/auth/queries/require-user";
import type { TransactionType } from "../types";

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseTransactionType(value: string): TransactionType {
  if (value !== "INCOME" && value !== "EXPENSE") {
    throw new Error("Invalid transaction type.");
  }

  return value;
}

function parseAmount(value: string) {
  const amount = Number(value.replaceAll(",", ""));

  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Invalid amount.");
  }

  return amount;
}

function parseTransactionForm(formData: FormData) {
  const transactionDate = getRequiredString(formData, "transactionDate");
  const type = parseTransactionType(getRequiredString(formData, "type"));
  const categoryId = Number(getRequiredString(formData, "categoryId"));
  const title = getRequiredString(formData, "title");
  const amount = parseAmount(getRequiredString(formData, "amount"));
  const memo = getRequiredString(formData, "memo") || null;
  const paymentMethod = getRequiredString(formData, "paymentMethod") || null;

  if (!transactionDate || !categoryId || !title) {
    throw new Error("Required transaction fields are missing.");
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

export async function createTransaction(formData: FormData) {
  await requireUser();

  const values = parseTransactionForm(formData);
  const intent = getRequiredString(formData, "intent");

  await db.insert(transactions).values(values);

  revalidatePath("/dashboard");
  revalidatePath("/transactions");

  if (intent === "continue") {
    redirect("/transactions/new?saved=1");
  }

  redirect("/transactions");
}

export async function updateTransaction(formData: FormData) {
  await requireUser();

  const id = Number(getRequiredString(formData, "id"));

  if (!id) {
    throw new Error("Transaction id is required.");
  }

  const values = parseTransactionForm(formData);

  await db
    .update(transactions)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(transactions.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);

  redirect("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  await requireUser();

  const id = Number(getRequiredString(formData, "id"));

  if (!id) {
    throw new Error("Transaction id is required.");
  }

  await db.delete(transactions).where(eq(transactions.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}
