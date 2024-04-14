import type { Element, ElementType, ElementAssets, ElementSize, ElementGroupDetail } from './element';

export type DataLayout = Pick<ElementSize, 'x' | 'y' | 'w' | 'h'> & {
  detail: Pick<
    ElementGroupDetail,
    'background' | 'borderWidth' | 'overflow' | 'borderColor' | 'borderDash' | 'borderRadius' | 'shadowBlur' | 'shadowColor' | 'shadowOffsetX' | 'shadowOffsetY'
  >;
  operations?: {
    disabledLeft?: boolean;
    disabledTop?: boolean;
    disabledRight?: boolean;
    disabledBottom?: boolean;
    disabledTopLeft?: boolean;
    disabledTopRight?: boolean;
    disabledBottomLeft?: boolean;
    disabledBottomRight?: boolean;
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
