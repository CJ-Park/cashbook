"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/db/schema";
import { formatCurrencyInput } from "@/shared/utils/number";
import type { TransactionType } from "../types";

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

export function TransactionForm({ categories, action, defaultValues, mode }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultValues?.type ?? "EXPENSE");
  const [amountDisplay, setAmountDisplay] = useState(
    defaultValues?.amount ? formatCurrencyInput(String(defaultValues.amount)) : "",
  );

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type || category.type === "COMMON"),
    [categories, type],
  );

  const numericAmount = amountDisplay.replace(/\D/g, "");

  return (
    <form action={action} className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <input type="hidden" name="amount" value={numericAmount} />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-base font-semibold text-zinc-800">날짜</span>
          <input
            name="transactionDate"
            type="date"
            required
            defaultValue={defaultValues?.transactionDate}
            className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-base font-semibold text-zinc-800">구분</span>
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
            className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
          >
            <option value="INCOME">입금</option>
            <option value="EXPENSE">출금</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-base font-semibold text-zinc-800">카테고리</span>
        <select
          name="categoryId"
          required
          defaultValue={defaultValues?.categoryId}
          className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
        >
          <option value="">선택</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-base font-semibold text-zinc-800">내용</span>
        <input
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-base font-semibold text-zinc-800">금액</span>
        <input
          type="text"
          inputMode="numeric"
          required
          value={amountDisplay}
          onChange={(event) => setAmountDisplay(formatCurrencyInput(event.target.value))}
          className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-base font-semibold text-zinc-800">메모</span>
        <textarea
          name="memo"
          defaultValue={defaultValues?.memo ?? ""}
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-3 py-3 text-base text-zinc-950"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-base font-semibold text-zinc-800">결제수단</span>
        <input
          name="paymentMethod"
          type="text"
          defaultValue={defaultValues?.paymentMethod ?? ""}
          className="min-h-12 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          name="intent"
          value="save"
          className="min-h-12 flex-1 rounded-md bg-zinc-900 px-5 text-base font-bold text-white hover:bg-zinc-800"
        >
          저장
        </button>
        {mode === "create" ? (
          <button
            type="submit"
            name="intent"
            value="continue"
            className="min-h-12 flex-1 rounded-md border border-zinc-300 bg-white px-5 text-base font-bold text-zinc-900 hover:bg-zinc-100"
          >
            저장 후 계속 입력
          </button>
        ) : null}
      </div>
    </form>
  );
}
