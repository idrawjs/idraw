
export function limitNum(num: number): number {
  const numStr: string = num.toFixed(2);
  return parseFloat(numStr);
}

export function limitAngle(angle: number): number {
  return limitNum(angle % 360);
}
