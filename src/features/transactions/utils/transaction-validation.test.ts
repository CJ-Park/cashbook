import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrencyInput } from "@/shared/utils/number";
import {
  isCategoryTypeCompatible,
  MAX_TRANSACTION_AMOUNT,
  parsePositiveSafeInteger,
  parseTransactionAmount,
  parseTransactionDate,
} from "./transaction-validation";

test("금액 표시는 큰 숫자도 반올림하지 않는다", () => {
  assert.equal(formatCurrencyInput("9007199254740993"), "9,007,199,254,740,993");
  assert.equal(formatCurrencyInput("0001234"), "1,234");
});

test("금액은 명시적 상한과 safe integer 범위를 검증한다", () => {
  assert.equal(
    parseTransactionAmount(MAX_TRANSACTION_AMOUNT.toLocaleString("ko-KR")),
    MAX_TRANSACTION_AMOUNT,
  );
  assert.throws(() => parseTransactionAmount(String(MAX_TRANSACTION_AMOUNT + 1)));
  assert.throws(() => parseTransactionAmount("9007199254740993"));
  assert.throws(() => parseTransactionAmount("-1"));
  assert.throws(() => parseTransactionAmount("1.5"));
});

test("거래 날짜는 실제 존재하는 날짜만 허용한다", () => {
  assert.equal(parseTransactionDate("2024-02-29"), "2024-02-29");
  assert.throws(() => parseTransactionDate("2025-02-29"));
  assert.throws(() => parseTransactionDate("2026-13-01"));
  assert.throws(() => parseTransactionDate("2026-7-01"));
});

test("거래 날짜도 검색과 동일한 지원 연도 범위를 사용한다", () => {
  assert.throws(() => parseTransactionDate("0001-01-01"));
  assert.equal(parseTransactionDate("1900-01-01"), "1900-01-01");
});

test("카테고리 타입은 거래 타입과 같거나 공통이어야 한다", () => {
  assert.equal(isCategoryTypeCompatible("INCOME", "INCOME"), true);
  assert.equal(isCategoryTypeCompatible("COMMON", "EXPENSE"), true);
  assert.equal(isCategoryTypeCompatible("EXPENSE", "INCOME"), false);
});

test("ID는 0보다 큰 safe integer만 허용한다", () => {
  assert.equal(parsePositiveSafeInteger("12", "거래"), 12);
  assert.throws(() => parsePositiveSafeInteger("0", "거래"));
  assert.throws(() => parsePositiveSafeInteger("9007199254740993", "거래"));
});
