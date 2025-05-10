export function formatNumber(num: number, opts?: { decimalPlaces?: number }): number {
  let decimalPlaces = 2;
  if (typeof opts?.decimalPlaces !== 'undefined' && opts?.decimalPlaces >= 0) {
    decimalPlaces = opts.decimalPlaces;
  }
  return parseFloat(num.toFixed(decimalPlaces));
}
