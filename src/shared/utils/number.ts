export function formatCurrencyInput(value: string) {
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) {
    return "";
  }

  const normalizedValue = numericValue.replace(/^0+(?=\d)/, "");

  return normalizedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
