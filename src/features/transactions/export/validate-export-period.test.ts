import assert from "node:assert/strict";
import test from "node:test";
import { validateTransactionExportPeriod } from "./validate-export-period";

test("시작일과 종료일을 모두 요구한다", () => {
  assert.equal(validateTransactionExportPeriod(undefined, "2026-12-31").isValid, false);
  assert.equal(validateTransactionExportPeriod("2026-01-01", undefined).isValid, false);
});

test("달력에 없는 날짜와 역순 기간을 거부한다", () => {
  assert.equal(validateTransactionExportPeriod("2026-02-30", "2026-03-01").isValid, false);
  assert.equal(validateTransactionExportPeriod("2026-03-02", "2026-03-01").isValid, false);
});

test("두 자리 연도 오프셋으로 1년 제한을 우회할 수 없다", () => {
  assert.equal(validateTransactionExportPeriod("0000-01-01", "1900-12-31").isValid, false);
  assert.equal(validateTransactionExportPeriod("0098-12-31", "1999-12-30").isValid, false);
});

test("1월 1일부터 12월 31일까지의 1년 기간을 허용한다", () => {
  assert.equal(validateTransactionExportPeriod("2026-01-01", "2026-12-31").isValid, true);
  assert.equal(validateTransactionExportPeriod("2026-01-01", "2027-01-01").isValid, false);
});

test("윤년 2월 29일부터 다음 해 2월 28일까지를 허용한다", () => {
  assert.equal(validateTransactionExportPeriod("2024-02-29", "2025-02-28").isValid, true);
  assert.equal(validateTransactionExportPeriod("2024-02-29", "2025-03-01").isValid, false);
});
