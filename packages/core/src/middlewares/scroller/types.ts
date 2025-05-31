import type { Point, ElementSize } from '@idraw/types';
import { keyXThumbRect, keyYThumbRect, keyPrevPoint, keyActivePoint, keyActiveThumbType, keyHoverXThumbRect, keyHoverYThumbRect } from './config';

export type DeepScrollerSharedStorage = {
  [keyXThumbRect]: null | ElementSize;
  [keyYThumbRect]: null | ElementSize;
  [keyHoverXThumbRect]: boolean | null;
  [keyHoverYThumbRect]: boolean | null;
  [keyPrevPoint]: null | Point;
  [keyActivePoint]: null | Point;
  [keyActiveThumbType]: null | 'X' | 'Y';
};
