"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { requireUser } from "@/features/auth/queries/require-user";
import type { CategoryType } from "../types";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseCategoryType(value: string): CategoryType {
  if (value !== "INCOME" && value !== "EXPENSE" && value !== "COMMON") {
    throw new Error("Invalid category type.");
  }

  return value;
}

function parseSortOrder(value: string) {
  const sortOrder = Number(value || 0);

  if (!Number.isInteger(sortOrder)) {
    throw new Error("Invalid sort order.");
  }

  return sortOrder;
}

export async function createCategory(formData: FormData) {
  await requireUser();

  const name = getString(formData, "name");

  if (!name) {
    throw new Error("Category name is required.");
  }

  await db.insert(categories).values({
    name,
    type: parseCategoryType(getString(formData, "type")),
    sortOrder: parseSortOrder(getString(formData, "sortOrder")),
  });

  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function updateCategory(formData: FormData) {
  await requireUser();

  const id = Number(getString(formData, "id"));
  const name = getString(formData, "name");

  if (!id || !name) {
    throw new Error("Category id and name are required.");
  }

  await db
    .update(categories)
    .set({
      name,
      type: parseCategoryType(getString(formData, "type")),
      sortOrder: parseSortOrder(getString(formData, "sortOrder")),
    })
    .where(eq(categories.id, id));

  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function toggleCategoryActive(formData: FormData) {
  await requireUser();

  const id = Number(getString(formData, "id"));
  const isActive = getString(formData, "isActive") === "true";

  if (!id) {
    throw new Error("Category id is required.");
  }

  await db.update(categories).set({ isActive }).where(eq(categories.id, id));

  revalidatePath("/categories");
  revalidatePath("/transactions");
}
