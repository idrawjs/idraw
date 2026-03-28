import type { MiddlewareScrollerStyles } from '@idraw/types';
import { createId } from '@idraw/util';

export const key = 'SCROLL';
export const keyXThumbStyle = Symbol(`${key}_xThumbStyle`);
export const keyYThumbStyle = Symbol(`${key}_yThumbStyle`);

export const keyPrevPoint = Symbol(`${key}_prevPoint`);
export const keyActivePoint = Symbol(`${key}_activePoint`);
export const keyActiveThumbType = Symbol(`${key}_activeThumbType`);

export const prefix = `idraw-middleware-scroller`;
export const getRootClassName = () => `${prefix}-${createId()}`;

export const scrollbarTrackSize = 16;
export const scrollbarThumbLength = scrollbarTrackSize * 2.5;
export const scrollbarThumbSize = scrollbarTrackSize * 0.5;

export const ATTR_THUMB_TYPE = 'data-idraw-thumb-type';

export const THUMB_X = 'X';
export const THUMB_Y = 'Y';

export const defaultStyles: MiddlewareScrollerStyles = {
  zIndex: 2,
  thumbBackground: '#0000003A',
  thumbBorderColor: '#0000008A',
  hoverThumbBackground: '#0000005F',
  hoverThumbBorderColor: '#000000EE',
  activeThumbBackground: '#0000005E',
  activeThumbBorderColor: '#000000F0',
};

export const classNameMap = {
  horizontal: `${prefix}-horizontal`,
  vertical: `${prefix}-vertical`,
  thumb: `${prefix}-thumb`,
};
