"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category } from "@/db/schema";
import { SubmitButton } from "@/shared/components/ui/SubmitButton";
import { formatCurrencyInput } from "@/shared/utils/number";
import type { TransactionType } from "../types";
import {
  isCategoryTypeCompatible,
  MAX_TRANSACTION_AMOUNT,
} from "../utils/transaction-validation";

type TransactionFormValues = {
  id?: number;
  transactionDate?: string;
  type?: TransactionType;
  categoryId?: number;
  title?: string;
  amount?: number;
  memo?: string | null;
  paymentMethod?: string | null;
};

type TransactionFormProps = {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: TransactionFormValues;
  mode: "create" | "edit";
};

const transactionTypes: Array<{
  value: TransactionType;
  label: string;
  description: string;
}> = [
  { value: "INCOME", label: "입금", description: "들어온 돈" },
  { value: "EXPENSE", label: "출금", description: "나간 돈" },
];

const paymentMethods = ["현금", "계좌이체", "카드", "간편결제"];
const maxAmountDisplayLength = formatCurrencyInput(String(MAX_TRANSACTION_AMOUNT)).length;

export function TransactionForm({ categories, action, defaultValues, mode }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultValues?.type ?? "EXPENSE");
  const initialCategoryId = defaultValues?.categoryId;
  const [categoryId, setCategoryId] = useState(() => {
    if (!initialCategoryId) {
      return "";
    }

    const initialCategory = categories.find((category) => category.id === initialCategoryId);
    return initialCategory && isCategoryTypeCompatible(initialCategory.type, defaultValues?.type ?? "EXPENSE")
      ? String(initialCategoryId)
      : "";
  });
  const [amountDisplay, setAmountDisplay] = useState(
    defaultValues?.amount !== undefined ? formatCurrencyInput(String(defaultValues.amount)) : "",
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          isCategoryTypeCompatible(category.type, type) &&
          (category.isActive ||
            (mode === "edit" &&
              category.id === initialCategoryId &&
              String(category.id) === categoryId)),
      ),
    [categories, categoryId, initialCategoryId, mode, type],
  );

  const numericAmount = amountDisplay.replace(/\D/g, "");
  const isKeepingInactiveCategory = categories.some(
    (category) => String(category.id) === categoryId && !category.isActive,
  );

  function changeType(nextType: TransactionType) {
    setType(nextType);

    if (!categoryId) {
      return;
    }

    const selectedCategory = categories.find((category) => String(category.id) === categoryId);

    if (!selectedCategory || !isCategoryTypeCompatible(selectedCategory.type, nextType)) {
      setCategoryId("");
    }
  }

  return (
    <form action={action} className="surface-card overflow-hidden">
      {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <input type="hidden" name="amount" value={numericAmount} />

      <div className="space-y-7 p-5 sm:p-7">
        <fieldset>
          <legend className="field-label">입금과 출금 중 선택해주세요</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {transactionTypes.map((option) => {
              const isSelected = type === option.value;
              const isIncome = option.value === "INCOME";

              return (
                <label
                  key={option.value}
                  className={`relative flex min-h-16 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 transition focus-within:ring-4 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 sm:min-h-24 sm:justify-start sm:gap-3 sm:px-5 ${
                    isSelected
                      ? isIncome
                        ? "border-[var(--income)] bg-[var(--income-soft)] text-[var(--income)]"
                        : "border-[var(--expense)] bg-[var(--expense-soft)] text-[var(--expense)]"
                      : "border-[var(--border)] bg-white text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => changeType(option.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-black sm:size-12 sm:text-xl ${
                      isSelected
                        ? isIncome
                          ? "bg-[var(--income)] text-white"
                          : "bg-[var(--expense)] text-white"
                        : "bg-[var(--surface-soft)] text-[var(--text-faint)]"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-black sm:text-xl">{option.label}</span>
                    <span className="hidden text-sm font-bold opacity-75 sm:block">{option.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`ml-auto hidden size-4 rounded-full border-2 sm:block ${
                      isSelected
                        ? isIncome
                          ? "border-[var(--income)] bg-[var(--income)] ring-4 ring-white"
                          : "border-[var(--expense)] bg-[var(--expense)] ring-4 ring-white"
                        : "border-[var(--border-strong)] bg-white"
                    }`}
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">날짜</span>
            <input
              name="transactionDate"
              type="date"
              required
              defaultValue={defaultValues?.transactionDate}
              className="field-control"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="transaction-category" className="field-label mb-0">
                카테고리
              </label>
              <Link
                href="/categories"
                className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-extrabold text-[var(--primary)] hover:bg-[var(--primary-soft)]"
              >
                카테고리 관리
                <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            </div>
            <select
              id="transaction-category"
              name="categoryId"
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="field-control"
            >
              <option value="">{filteredCategories.length > 0 ? "카테고리를 선택하세요" : "사용 가능한 카테고리가 없습니다"}</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}{category.isActive ? "" : " (사용 중지됨 · 기존 선택 유지)"}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm font-medium text-[var(--text-faint)]">
              {isKeepingInactiveCategory
                ? "기존 내역의 카테고리는 그대로 유지할 수 있어요. 다른 카테고리로 바꾸면 다시 선택할 수 없어요."
                : `선택한 ${type === "INCOME" ? "입금" : "출금"}에 맞는 카테고리만 보여드려요.`}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="field-label">내용</span>
          <input
            name="title"
            type="text"
            required
            defaultValue={defaultValues?.title}
            placeholder="예: 재료 구입, 상품 판매"
            className="field-control"
          />
        </label>

        <label className="block">
          <span className="field-label">금액</span>
          <span className="relative block">
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={maxAmountDisplayLength}
              value={amountDisplay}
              onChange={(event) => setAmountDisplay(formatCurrencyInput(event.target.value))}
              placeholder="0"
              aria-describedby="amount-help"
              className="field-control money min-h-16 text-right text-2xl font-black sm:min-h-20 sm:text-3xl"
              style={{ paddingRight: "4rem" }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-lg font-black text-[var(--text-soft)]"
            >
              원
            </span>
          </span>
          <span id="amount-help" className="mt-2 block text-sm font-medium text-[var(--text-faint)]">
            숫자만 입력하면 천 단위 쉼표가 자동으로 표시됩니다. 한 건당 최대 {formatCurrencyInput(String(MAX_TRANSACTION_AMOUNT))}원까지 입력할 수 있어요.
          </span>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">결제수단 <span className="font-medium text-[var(--text-faint)]">(선택)</span></span>
            <input
              name="paymentMethod"
              type="text"
              list="payment-method-options"
              defaultValue={defaultValues?.paymentMethod ?? ""}
              placeholder="목록에서 고르거나 직접 입력"
              className="field-control"
            />
            <datalist id="payment-method-options">
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod} value={paymentMethod} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="field-label">메모 <span className="font-medium text-[var(--text-faint)]">(선택)</span></span>
            <textarea
              name="memo"
              defaultValue={defaultValues?.memo ?? ""}
              rows={3}
              placeholder="기억할 내용을 짧게 적어주세요"
              className="field-control"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:justify-end sm:p-5">
        {mode === "create" ? (
          <SubmitButton
            name="intent"
            value="continue"
            pendingLabel="저장 중..."
            className="button-secondary min-h-14 w-full sm:w-auto sm:min-w-52"
          >
            저장 후 계속 입력
          </SubmitButton>
        ) : (
          <Link href="/transactions" className="button-secondary min-h-14 w-full sm:w-auto sm:min-w-32">
            취소
          </Link>
        )}
        <SubmitButton
          name="intent"
          value="save"
          pendingLabel="저장 중..."
          className="button-primary min-h-14 w-full sm:w-auto sm:min-w-40"
        >
          {mode === "create" ? "저장" : "수정 내용 저장"}
        </SubmitButton>
      </div>
    </form>
  );
}
