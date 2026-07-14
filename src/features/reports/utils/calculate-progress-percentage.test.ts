import assert from "node:assert/strict";
import test from "node:test";
import { calculateProgressPercentage } from "./calculate-progress-percentage";

test("bigint 정수 연산으로 0부터 100 사이의 비율을 계산한다", () => {
  const maximum = BigInt("27021597764222979");

  assert.equal(calculateProgressPercentage(BigInt(0), maximum), 0);
  assert.equal(
    calculateProgressPercentage(BigInt("9007199254740993"), maximum),
    33,
  );
  assert.equal(calculateProgressPercentage(maximum, maximum), 100);
  assert.equal(calculateProgressPercentage(maximum + BigInt(1), maximum), 100);
});

test("0보다 큰 매우 작은 금액도 최소 2% 너비로 표시한다", () => {
  assert.equal(
    calculateProgressPercentage(BigInt(1), BigInt("9007199254740993000")),
    2,
  );
  assert.equal(calculateProgressPercentage(BigInt(1), BigInt(0)), 0);
});
