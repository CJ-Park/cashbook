export function formatCurrencyInput(value: string) {
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) {
    return "";
  }

  return Number(numericValue).toLocaleString("ko-KR");
}
