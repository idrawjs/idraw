import type { MiddlewareRulerConfig, MiddlewareRulerStyles } from '@idraw/types';
import { getMiddlewareValidStyles } from '@idraw/util';

export const rulerSize = 16;
export const fontSize = 10;
export const fontWeight = 100;
export const lineSize = 1;
export const fontFamily = 'monospace';

const background = '#FFFFFFA8';
const stroke = '#00000080';
const scaleColor = '#000000';
const textColor = '#00000080';
const gridColor = '#AAAAAA20';
const gridPrimaryColor = '#AAAAAA40';
const selectedAreaColor = '#19609780';

export const defaultStyle: MiddlewareRulerStyles = {
  background,
  stroke,
  scaleColor,
  textColor,
  gridColor,
  gridPrimaryColor,
  selectedAreaColor,
};

export function getMiddlewareRulerStyles<C = MiddlewareRulerConfig, S = MiddlewareRulerStyles>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'background',
    'stroke',
    'scaleColor',
    'textColor',
    'gridColor',
    'gridPrimaryColor',
    'selectedAreaColor',
  ]);
  return styles;
}
