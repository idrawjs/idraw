import type { Element, ElementType, ElementSize } from './element';
import type { Point } from './point';
import type { Data } from './data';

export interface ViewScaleInfo {
  scale: number;
  offsetTop: number;
  offsetBottom: number;
  offsetLeft: number;
  offsetRight: number;
}

export interface ViewSizeInfo {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
}

export interface ViewContent {
  viewContext: CanvasRenderingContext2D;
  helperContext: CanvasRenderingContext2D;
  boardContext: CanvasRenderingContext2D;
}

export interface ViewCalculatorOptions {
  viewContent: ViewContent;
}

export interface ViewCalculator {
  viewScale(num: number, prevScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): ViewScaleInfo;
  isElementInView(elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean;
  isPointInElement(p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean;
  pointToViewPoint(p: Point): Point;
  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo): ElementSize;
  getPointElement(p: Point, data: Data, scaleInfo: ViewScaleInfo): { index: number; element: null | Element<ElementType> };
  viewScroll(opts: { moveX?: number; moveY?: number }, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo;
  // TODO
}
