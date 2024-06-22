import type { Element, ElementType, ElementAssets, ElementSize, ElementGroupDetail, ElementGlobalDetail } from './element';

export type DataLayout = Pick<ElementSize, 'x' | 'y' | 'w' | 'h'> & {
  detail: Pick<
    ElementGroupDetail,
    'background' | 'borderWidth' | 'overflow' | 'borderColor' | 'borderDash' | 'borderRadius' | 'shadowBlur' | 'shadowColor' | 'shadowOffsetX' | 'shadowOffsetY'
  >;
  operations?: {
    position?: 'absolute' | 'relative';
  };
};

export type Data<E extends Record<string, any> = Record<string, any>> = {
  elements: Element<ElementType, E>[];
  assets?: ElementAssets;
  layout?: DataLayout;
  global?: ElementGlobalDetail;
};

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
