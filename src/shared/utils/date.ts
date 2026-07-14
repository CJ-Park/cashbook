export const MIN_SUPPORTED_YEAR = 1900;
export const MAX_SUPPORTED_YEAR = 9999;

export function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));

  if (year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateOptionalDateRange(startDate?: string, endDate?: string) {
  if (startDate && !isValidDateInput(startDate)) {
    return "시작일이 올바르지 않습니다.";
  }

  if (endDate && !isValidDateInput(endDate)) {
    return "종료일이 올바르지 않습니다.";
  }

  if (startDate && endDate && startDate > endDate) {
    return "종료일은 시작일보다 빠를 수 없습니다.";
  }

  return null;
}
