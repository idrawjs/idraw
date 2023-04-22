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

export interface ViewSizeInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  contextWidth: number;
  contextHeight: number;
}

export interface ViewContent {
  viewContext: CanvasRenderingContext2D | ViewContext2D;
  helperContext: CanvasRenderingContext2D | ViewContext2D;
  boardContext: CanvasRenderingContext2D | ViewContext2D;
}

export interface ViewCalculatorOptions {
  viewContent: ViewContent;
}

export interface ViewCalculator {
  viewScale(num: number, prevScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): ViewScaleInfo;
  isElementInView(elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean;
  isPointInElement(ctx: ViewContext2D | CanvasRenderingContext2D | ViewContext2D, p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean;
  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo): ElementSize;
  viewScroll(opts: { moveX?: number; moveY?: number }, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo;
  getPointElement(
    ctx: ViewContext2D | CanvasRenderingContext2D | ViewContext2D,
    p: Point,
    data: Data,
    scaleInfo: ViewScaleInfo
  ): { index: number; element: null | Element<ElementType> };
  rotateElementSize(elemSize: ElementSize): PointSize[];
  // pointToViewPoint(  p: Point): Point;
  // TODO
}
