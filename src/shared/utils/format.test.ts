import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCurrency,
  getKoreaMonthRange,
  getKoreaYear,
  toDateInputValue,
} from "./format";

test("안전 정수 범위를 넘는 bigint 금액을 반올림 없이 표시한다", () => {
  assert.equal(formatCurrency(BigInt("9007199254740993")), "9,007,199,254,740,993원");
  assert.equal(formatCurrency(BigInt("-9007199254740993")), "-9,007,199,254,740,993원");
});

test("한국 자정을 지난 즉시 한국 날짜로 변환한다", () => {
  const now = new Date("2026-07-31T15:30:00.000Z");

  assert.equal(toDateInputValue(now), "2026-08-01");
  assert.deepEqual(getKoreaMonthRange(now), {
    startDate: "2026-08-01",
    endDate: "2026-09-01",
  });
});

test("한국 시간의 연도 경계를 사용한다", () => {
  const beforeNewYear = new Date("2025-12-31T14:59:59.000Z");
  const afterNewYear = new Date("2025-12-31T15:00:00.000Z");

  assert.equal(toDateInputValue(beforeNewYear), "2025-12-31");
  assert.equal(getKoreaYear(beforeNewYear), 2025);
  assert.deepEqual(getKoreaMonthRange(beforeNewYear), {
    startDate: "2025-12-01",
    endDate: "2026-01-01",
  });
  assert.equal(toDateInputValue(afterNewYear), "2026-01-01");
  assert.equal(getKoreaYear(afterNewYear), 2026);
  assert.deepEqual(getKoreaMonthRange(afterNewYear), {
    startDate: "2026-01-01",
    endDate: "2026-02-01",
  });
});
