export function formatNumber(num: number, opts?: { decimalPlaces?: number }): number {
  const decimalPlaces = opts?.decimalPlaces || 2;
  return parseFloat(num.toFixed(decimalPlaces));
}
