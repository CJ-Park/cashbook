import type { CategoryType } from "@/features/categories/types";
import {
  isValidDateInput,
  MAX_SUPPORTED_YEAR,
  MIN_SUPPORTED_YEAR,
} from "@/shared/utils/date";
import type { TransactionType } from "../types";

export const MAX_TRANSACTION_AMOUNT = 999_999_999_999;

export function parseTransactionType(value: string): TransactionType {
  if (value !== "INCOME" && value !== "EXPENSE") {
    throw new Error("입금또는 출금 중 하나를 선택해주세요.");
  }

  return value;
}

export function parseTransactionDate(value: string) {
  if (!isValidDateInput(value)) {
    throw new Error(
      `${MIN_SUPPORTED_YEAR}년부터 ${MAX_SUPPORTED_YEAR}년 사이의 존재하는 날짜를 입력해주세요.`,
    );
  }

  return value;
}

export function parseTransactionAmount(value: string) {
  const numericValue = value.replaceAll(",", "").trim();

  if (!/^\d+$/.test(numericValue)) {
    throw new Error("금액은 0 이상의 숫자로 입력해주세요.");
  }

  const amount = Number(numericValue);

  if (!Number.isSafeInteger(amount) || amount > MAX_TRANSACTION_AMOUNT) {
    throw new Error(
      `금액은 ${MAX_TRANSACTION_AMOUNT.toLocaleString("ko-KR")}원 이하로 입력해주세요.`,
    );
  }

  return amount;
}

export function parsePositiveSafeInteger(value: string, fieldLabel: string) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${fieldLabel} 정보가 올바르지 않습니다.`);
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${fieldLabel} 정보가 올바르지 않습니다.`);
  }

  return parsedValue;
}

export function isCategoryTypeCompatible(
  categoryType: CategoryType,
  transactionType: TransactionType,
) {
  return categoryType === "COMMON" || categoryType === transactionType;
}
