import type { Element, ElementType, ElementAssets } from './element';

export type DataUnderlay = Omit<Element<'rect'>, 'uuid' | 'angle'>; // TODO color background

export interface Data<E extends Record<string, any> = Record<string, any>> {
  elements: Element<ElementType, E>[];
  assets?: ElementAssets;
  underlay?: DataUnderlay; // Rect or Color
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
