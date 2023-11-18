import type { Element, ElementType, ElementSize } from './element';
import type { Point, PointSize } from './point';
import type { Data } from './data';
import type { ViewContext2D } from './context2d';

export interface ViewScaleInfo {
  scale: number;
  offsetTop: number;
  offsetBottom: number;
  offsetLeft: number;
  offsetRight: number;
}

export interface ViewContextSize {
  contextWidth: number;
  contextHeight: number;
}

export interface ViewSizeInfo extends ViewContextSize {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface ViewContent {
  viewContext: ViewContext2D;
  helperContext: ViewContext2D;
  boardContext: ViewContext2D;
}

export interface ViewCalculatorOptions {
  viewContent: ViewContent;
}

export interface ViewCalculator {
  isElementInView(elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean;
  isPointInElement(p: Point, elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): boolean;
  elementSize(size: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ElementSize;
  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; groupQueue?: Element<'group'>[] }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number };
}

export type ViewRectVertexes = [PointSize, PointSize, PointSize, PointSize];

export interface ViewBoxSize {
  x: number;
  y: number;
  w: number;
  h: number;
  radiusList: [number, number, number, number];
}
