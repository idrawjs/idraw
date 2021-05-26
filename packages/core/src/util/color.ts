export function toColorHexNum(color: string): number {
  return parseInt(color.replace(/^\#/, '0x'));
}

export function toColorHexStr(color: number): string {
  return '#' + color.toString(16);
}