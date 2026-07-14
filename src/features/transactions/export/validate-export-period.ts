import { isValidTransactionSearchDate } from "../queries/search-conditions";

export type ExportPeriodValidation = {
  isValid: boolean;
  message: string;
};

function toUtcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function getMaximumInclusiveEndDate(date: Date) {
  const nextAnniversary = new Date(
    Date.UTC(date.getUTCFullYear() + 1, date.getUTCMonth(), date.getUTCDate()),
  );

  nextAnniversary.setUTCDate(nextAnniversary.getUTCDate() - 1);
  return nextAnniversary;
}

export function validateTransactionExportPeriod(
  startDate?: string | null,
  endDate?: string | null,
): ExportPeriodValidation {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      message: "엑셀 다운로드는 시작일과 종료일을 모두 지정해야 합니다.",
    };
  }

  if (!isValidTransactionSearchDate(startDate) || !isValidTransactionSearchDate(endDate)) {
    return {
      isValid: false,
      message: "엑셀 다운로드 날짜가 올바르지 않습니다.",
    };
  }

  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);

  if (start > end) {
    return {
      isValid: false,
      message: "엑셀 다운로드 종료일은 시작일보다 빠를 수 없습니다.",
    };
  }

  if (end > getMaximumInclusiveEndDate(start)) {
    return {
      isValid: false,
      message: "엑셀 다운로드 기간은 최대 1년까지 선택할 수 있습니다.",
    };
  }

  return {
    isValid: true,
    message: "현재 검색 조건의 최대 1년치 내역을 엑셀로 내려받습니다.",
  };
}
