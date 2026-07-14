export function formatCurrency(amount: number | bigint) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export const KOREA_TIME_ZONE = "Asia/Seoul";

const koreaDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: KOREA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getKoreaDateParts(date: Date) {
  const parts = koreaDatePartsFormatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function formatDate(date: string | Date) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "long",
  }).format(date);
}

export function toDateInputValue(date: Date) {
  const { year, month, day } = getKoreaDateParts(date);

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getKoreaMonthRange(date: Date) {
  const { year, month } = getKoreaDateParts(date);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    startDate: `${year}-${String(month).padStart(2, "0")}-01`,
    endDate: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

export function getKoreaYear(date: Date) {
  return getKoreaDateParts(date).year;
}
