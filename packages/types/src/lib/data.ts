import type { Element, ElementType, ElementAssets } from './element';

export interface Data {
  elements: Element<ElementType>[];
  assets?: ElementAssets;
}

export type ColorMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
