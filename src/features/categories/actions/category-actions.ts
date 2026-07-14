"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { categories, transactions } from "@/db/schema";
import { requireFreshUser } from "@/features/auth/queries/require-fresh-user";
import type { CategoryType } from "../types";

const MAX_CATEGORY_NAME_LENGTH = 50;

class CategoryValidationError extends Error {}

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function hasErrorCode(error: unknown, expectedCode: string) {
  let current = error;

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== "object" || current === null) {
      return false;
    }

    if ("code" in current && current.code === expectedCode) {
      return true;
    }

    current = "cause" in current ? current.cause : undefined;
  }

  return false;
}

function getCategoryActionError(error: unknown): CategoryActionState {
  if (hasErrorCode(error, "23505")) {
    return { status: "error", message: "같은 이름과 사용처의 카테고리가 이미 있습니다." };
  }

  if (error instanceof CategoryValidationError) {
    return { status: "error", message: error.message };
  }

  return { status: "error", message: "카테고리를 저장하지 못했습니다. 잠시 후 다시 시도해주세요." };
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseCategoryType(value: string): CategoryType {
  if (value !== "INCOME" && value !== "EXPENSE" && value !== "COMMON") {
    throw new CategoryValidationError("카테고리를 사용할 곳을 선택해주세요.");
  }

  return value;
}

function parseSortOrder(value: string) {
  const sortOrder = Number(value || 0);

  if (
    !Number.isSafeInteger(sortOrder) ||
    sortOrder < -2_147_483_648 ||
    sortOrder > 2_147_483_647
  ) {
    throw new CategoryValidationError("표시 순서는 정수로 입력해주세요.");
  }

  return sortOrder;
}

function parseCategoryId(value: string) {
  if (!/^\d+$/.test(value)) {
    throw new CategoryValidationError("카테고리 정보가 올바르지 않습니다.");
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new CategoryValidationError("카테고리 정보가 올바르지 않습니다.");
  }

  return id;
}

function assertCategoryName(name: string) {
  if (!name) {
    throw new CategoryValidationError("카테고리 이름을 입력해주세요.");
  }

  if (name.length > MAX_CATEGORY_NAME_LENGTH) {
    throw new CategoryValidationError(
      `카테고리 이름은 ${MAX_CATEGORY_NAME_LENGTH}자 이하로 입력해주세요.`,
    );
  }
}

export async function createCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireFreshUser();

  try {
    const name = getString(formData, "name");
    assertCategoryName(name);

    await db.insert(categories).values({
      userId: user.id,
      name,
      type: parseCategoryType(getString(formData, "type")),
      sortOrder: parseSortOrder(getString(formData, "sortOrder")),
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { status: "success", message: "카테고리를 추가했습니다." };
  } catch (error) {
    return getCategoryActionError(error);
  }
}

export async function updateCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireFreshUser();

  try {
    const id = parseCategoryId(getString(formData, "id"));
    const name = getString(formData, "name");
    const type = parseCategoryType(getString(formData, "type"));
    const sortOrder = parseSortOrder(getString(formData, "sortOrder"));
    assertCategoryName(name);

    await db.transaction(async (tx) => {
      // Transaction writes lock the same row before validating category state.
      const [currentCategory] = await tx
        .select({ type: categories.type })
        .from(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
        .for("update")
        .limit(1);

      if (!currentCategory) {
        throw new CategoryValidationError("수정할 카테고리를 찾을 수 없습니다.");
      }

      if (currentCategory.type !== type) {
        const [linkedTransaction] = await tx
          .select({ id: transactions.id })
          .from(transactions)
          .where(and(eq(transactions.categoryId, id), eq(transactions.userId, user.id)))
          .limit(1);

        if (linkedTransaction) {
          throw new CategoryValidationError(
            "거래가 있는 카테고리는 사용할 곳을 변경할 수 없습니다.",
          );
        }
      }

      await tx
        .update(categories)
        .set({ name, type, sortOrder })
        .where(and(eq(categories.id, id), eq(categories.userId, user.id)));
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { status: "success", message: "카테고리 변경을 저장했습니다." };
  } catch (error) {
    return getCategoryActionError(error);
  }
}

export async function toggleCategoryActive(formData: FormData) {
  const user = await requireFreshUser();

  const id = parseCategoryId(getString(formData, "id"));
  const isActive = getString(formData, "isActive") === "true";

  await db
    .update(categories)
    .set({ isActive })
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

  revalidatePath("/categories");
  revalidatePath("/transactions");
}
