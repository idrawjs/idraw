import type { Element, ElementType, ElementAssets, ElementSize, ElementGroupDetail } from './element';

export type DataLayout = Pick<ElementSize, 'w' | 'h'> & {
  detail: Omit<ElementGroupDetail, 'children'>;
};
export interface Data<E extends Record<string, any> = Record<string, any>> {
  elements: Element<ElementType, E>[];
  assets?: ElementAssets;
  layout?: DataLayout;
}

export type Matrix = [
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

export type ColorMatrix = Matrix;
