import type { Element, ElementType, ElementAssets, ElementSize, ElementGroupDetail } from './element';

export type DataLayout = Pick<ElementSize, 'x' | 'y' | 'w' | 'h'> & {
  detail: Pick<
    ElementGroupDetail,
    'background' | 'borderWidth' | 'overflow' | 'borderColor' | 'borderDash' | 'borderRadius' | 'shadowBlur' | 'shadowColor' | 'shadowOffsetX' | 'shadowOffsetY'
  >;
  operations?: {
    disableLeft?: boolean;
    disableTop?: boolean;
    disableRight?: boolean;
    disableBottom?: boolean;
    disableTopLeft?: boolean;
    disableTopRight?: boolean;
    disableBottomLeft?: boolean;
    disableBottomRight?: boolean;
  };
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
