"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category } from "@/db/schema";
import type { TransactionSearchCondition, TransactionType } from "../types";

type TransactionSearchFormProps = {
  categories: Category[];
  condition: TransactionSearchCondition;
};

function canUseCategory(category: Category, type: TransactionType | "") {
  return !type || category.type === type || category.type === "COMMON";
}

export function TransactionSearchForm({ categories, condition }: TransactionSearchFormProps) {
  const [type, setType] = useState<TransactionType | "">(condition.type ?? "");
  const [categoryId, setCategoryId] = useState(() => {
    const initialCategory = categories.find((category) => category.id === condition.categoryId);

    return initialCategory && canUseCategory(initialCategory, condition.type ?? "")
      ? String(initialCategory.id)
      : "";
  });

  const filteredCategories = useMemo(
    () => categories.filter((category) => canUseCategory(category, type)),
    [categories, type],
  );

  function changeType(nextType: TransactionType | "") {
    setType(nextType);

    if (!categoryId) {
      return;
    }

    const selectedCategory = categories.find((category) => String(category.id) === categoryId);

    if (!selectedCategory || !canUseCategory(selectedCategory, nextType)) {
      setCategoryId("");
    }
  }

  return (
    <form method="get" className="surface-card p-4 sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-[-0.025em] text-[var(--text)]">검색 조건</h2>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            원하는 기간과 분류를 선택해 내역을 빠르게 찾으세요.
          </p>
        </div>
        <p className="mt-2 text-xs font-bold text-[var(--text-faint)] sm:mt-0">내용과 메모를 함께 검색합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
        <label className="block xl:col-span-2">
          <span className="field-label">시작일</span>
          <input
            name="startDate"
            type="date"
            defaultValue={condition.startDate}
            className="field-control"
          />
        </label>

        <label className="block xl:col-span-2">
          <span className="field-label">종료일</span>
          <input
            name="endDate"
            type="date"
            defaultValue={condition.endDate}
            className="field-control"
          />
        </label>

        <label className="block xl:col-span-2">
          <span className="field-label">구분</span>
          <select
            name="type"
            value={type}
            onChange={(event) => changeType(event.target.value as TransactionType | "")}
            className="field-control"
          >
            <option value="">전체</option>
            <option value="INCOME">입금</option>
            <option value="EXPENSE">출금</option>
          </select>
        </label>

        <label className="block xl:col-span-2">
          <span className="field-label">카테고리</span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="field-control"
          >
            <option value="">전체</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2 xl:col-span-4">
          <span className="field-label">검색어</span>
          <input
            name="keyword"
            type="search"
            defaultValue={condition.keyword}
            placeholder="내용 또는 메모 검색"
            className="field-control"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link href="/transactions" className="button-secondary w-full sm:w-auto sm:min-w-28">
          초기화
        </Link>
        <button type="submit" className="button-primary w-full sm:w-auto sm:min-w-32">
          검색하기
        </button>
      </div>
      <p className="mt-3 text-xs font-bold text-[var(--text-faint)] sm:text-right">
        엑셀 다운로드는 시작일과 종료일을 모두 지정한 최대 1년 범위에서 사용할 수 있습니다.
      </p>
    </form>
  );
}
