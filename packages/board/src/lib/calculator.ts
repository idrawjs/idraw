import type { Point, Data, Element, ElementType, ViewCalculator, ViewCalculatorOptions, ViewScaleInfo, ElementSize, ViewSizeInfo } from '@idraw/types';
import { calcElementSize, isViewPointInElement, getViewPointAtElement, isElementInView } from '@idraw/util';

export class Calculator implements ViewCalculator {
  private _opts: ViewCalculatorOptions;

  constructor(opts: ViewCalculatorOptions) {
    this._opts = opts;
  }

  elementSize(size: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ElementSize {
    return calcElementSize(size, { viewScaleInfo, viewSizeInfo });
  }

  isElementInView(elem: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    return isElementInView(elem, { viewScaleInfo, viewSizeInfo });
  }

  isPointInElement(p: Point, elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    const context2d = this._opts.viewContent.boardContext;
    return isViewPointInElement(p, {
      context2d,
      element: elem,
      viewScaleInfo,
      viewSizeInfo
    });
  }

  getPointElement(
    p: Point,
    opts: { data: Data; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
  ): { index: number; element: null | Element<ElementType>; groupQueueIndex: number } {
    const context2d = this._opts.viewContent.boardContext;
    return getViewPointAtElement(p, { ...opts, ...{ context2d } });
  }
}
