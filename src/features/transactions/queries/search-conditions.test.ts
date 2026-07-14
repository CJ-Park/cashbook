import assert from "node:assert/strict";
import test from "node:test";
import { escapeLikePattern, parseTransactionSearchParams } from "./search-conditions";

test("역순 검색 기간을 명시적 오류로 반환한다", () => {
  const condition = parseTransactionSearchParams(
    new URLSearchParams({ startDate: "2026-12-31", endDate: "2026-01-01" }),
  );

  assert.equal(condition.startDate, "2026-12-31");
  assert.equal(condition.endDate, "2026-01-01");
  assert.equal(condition.validationError, "종료일은 시작일보다 빠를 수 없습니다.");
});

test("카테고리 ID는 양의 safe integer만 허용한다", () => {
  assert.equal(
    parseTransactionSearchParams(new URLSearchParams({ categoryId: "1.5" })).categoryId,
    undefined,
  );
  assert.equal(
    parseTransactionSearchParams(new URLSearchParams({ categoryId: "42" })).categoryId,
    42,
  );
});

test("검색어의 LIKE 특수문자는 문자 그대로 검색되도록 이스케이프한다", () => {
  assert.equal(escapeLikePattern("100%_완료!"), "100!%!_완료!!");
});
