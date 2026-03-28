import type { Point, HTMLCSSProps } from '@idraw/types';
import { keyXThumbStyle, keyYThumbStyle, keyPrevPoint, keyActivePoint, keyActiveThumbType } from './static';

export type DeepScrollerSharedStorage = {
  [keyXThumbStyle]: null | HTMLCSSProps;
  [keyYThumbStyle]: null | HTMLCSSProps;

  [keyPrevPoint]: null | Point;
  [keyActivePoint]: null | Point;
  [keyActiveThumbType]: null | 'X' | 'Y';
};

export type ScrollbarStyles = {
  xThumbStyle: HTMLCSSProps | null;
  yThumbStyle: HTMLCSSProps | null;
};
