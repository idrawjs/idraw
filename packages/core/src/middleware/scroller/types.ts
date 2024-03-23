import type { Point, ElementSize } from '@idraw/types';
import { keyXThumbRect, keyYThumbRect, keyPrevPoint, keyActivePoint, keyActiveThumbType } from './config';

export type DeepScrollerSharedStorage = {
  [keyXThumbRect]: null | ElementSize;
  [keyYThumbRect]: null | ElementSize;
  [keyPrevPoint]: null | Point;
  [keyActivePoint]: null | Point;
  [keyActiveThumbType]: null | 'X' | 'Y';
};
