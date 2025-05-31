import type { MiddlewareScrollerStyle } from '@idraw/types';

export const key = 'SCROLL';
export const keyXThumbRect = Symbol(`${key}_xThumbRect`);
export const keyYThumbRect = Symbol(`${key}_yThumbRect`);
export const keyHoverXThumbRect = Symbol(`${key}_hoverXThumbRect`);
export const keyHoverYThumbRect = Symbol(`${key}_hoverYThumbRect`);
export const keyPrevPoint = Symbol(`${key}_prevPoint`);
export const keyActivePoint = Symbol(`${key}_activePoint`);
export const keyActiveThumbType = Symbol(`${key}_activeThumbType`);

export const defaultStyle: MiddlewareScrollerStyle = {
  thumbBackground: '#0000003A',
  thumbBorderColor: '#0000008A',
  hoverThumbBackground: '#0000005F',
  hoverThumbBorderColor: '#000000EE',
  activeThumbBackground: '#0000005E',
  activeThumbBorderColor: '#000000F0'
};
