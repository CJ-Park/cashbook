import assert from "node:assert/strict";
import test from "node:test";
import { isValidDateInput, validateOptionalDateRange } from "./date";

test("실제 달력 날짜만 허용한다", () => {
  assert.equal(isValidDateInput("2024-02-29"), true);
  assert.equal(isValidDateInput("2025-02-29"), false);
  assert.equal(isValidDateInput("infinity"), false);
});

test("지원 범위를 벗어난 연도는 허용하지 않는다", () => {
  assert.equal(isValidDateInput("0000-01-01"), false);
  assert.equal(isValidDateInput("0099-12-31"), false);
  assert.equal(isValidDateInput("1899-12-31"), false);
  assert.equal(isValidDateInput("1900-01-01"), true);
});

test("선택 기간의 순서를 검증한다", () => {
  assert.equal(validateOptionalDateRange("2026-01-01", "2026-12-31"), null);
  assert.equal(
    validateOptionalDateRange("2026-12-31", "2026-01-01"),
    "종료일은 시작일보다 빠를 수 없습니다.",
  );
});
