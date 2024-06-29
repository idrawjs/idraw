import type { MiddlewareRulerStyle } from '@idraw/types';

export const rulerSize = 16;
export const fontSize = 10;
export const fontWeight = 100;
export const lineSize = 1;
export const fontFamily = 'monospace';

const background = '#FFFFFFA8';
const borderColor = '#00000080';
const scaleColor = '#000000';
const textColor = '#00000080';
const gridColor = '#AAAAAA20';
const gridPrimaryColor = '#AAAAAA40';
const selectedAreaColor = '#196097';

export const defaultStyle: MiddlewareRulerStyle = {
  background,
  borderColor,
  scaleColor,
  textColor,
  gridColor,
  gridPrimaryColor,
  selectedAreaColor
};
