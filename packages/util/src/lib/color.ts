export function toColorHexNum(color: string): number {
  return parseInt(color.replace(/^\#/, '0x'));
}

export function toColorHexStr(color: number): string {
  return '#' + color.toString(16);
}

export function isColorStr(color?: string): boolean {
  return  typeof color === 'string' && /^\#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color);
}