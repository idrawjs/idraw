import type { Point, MaterialType } from '@idraw/types';
import { keyStartPoint, keyEndPoint, keyActiveMaterialType } from './static';

export type CreatorSharedStorage = {
  [keyStartPoint]: Point | null;
  [keyEndPoint]: Point | null;
  [keyActiveMaterialType]: Exclude<MaterialType, 'path' | 'foreignObject' | 'svgCode'> | null;
};
