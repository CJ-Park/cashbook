export function calculateProgressPercentage(amount: bigint, maximum: bigint) {
  const zero = BigInt(0);
  const minimumVisiblePercentage = BigInt(2);
  const oneHundred = BigInt(100);

  if (amount <= zero || maximum <= zero) {
    return 0;
  }

  const percentage = (amount * oneHundred) / maximum;
  const visiblePercentage =
    percentage < minimumVisiblePercentage ? minimumVisiblePercentage : percentage;
  const clamped = visiblePercentage > oneHundred ? oneHundred : visiblePercentage;

  return Number(clamped);
}
