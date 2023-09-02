import type { Element, ElementType, ElementAssets } from './element';

export interface Data<E extends Record<string, any> = Record<string, any>> {
  elements: Element<ElementType, E>[];
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
