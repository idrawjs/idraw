import type { Data, PointSize, Point, Element, ElementType, ViewCalculator, ViewCalculatorOptions, ViewScaleInfo, ElementSize } from '../types';

export class Calculator implements ViewCalculator {
  private _opts: ViewCalculatorOptions;

  constructor(opts: ViewCalculatorOptions) {
    this._opts = opts;
  }

  private _getBoardSize(): { width: number; height: number } {
    return {
      width: this._opts.viewContent.boardContext.canvas.width,
      height: this._opts.viewContent.boardContext.canvas.height
    };
  }

  viewScale(num: number, prevScaleInfo?: ViewScaleInfo): ViewScaleInfo {
    // TODO
  }

  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo): ElementSize {
    const { x, y, w, h } = size;
    const { scale, offsetTop, offsetLeft } = scaleInfo;
    return {
      x: x * scale + offsetLeft,
      y: y * scale + offsetTop,
      w: w * scale,
      h: h * scale
    };
  }

  isElementInView(elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean {
    // TODO
    const { width, height } = this._getBoardSize();
    const { scale = 1, offsetTop = 0, offsetLeft = 0 } = scaleInfo;

    // Virtual View Point
    // const vvp0: PointSize = { x: offsetLeft, y: offsetTop };
    // const vvp1: PointSize = { x: offsetLeft + width, y: offsetTop };
    // const vvp2: PointSize = { x: offsetLeft + width, y: offsetTop + height };
    // const vvp3: PointSize = { x: offsetLeft, y: offsetTop + height };
    const vvpStart: PointSize = { x: offsetLeft, y: offsetTop };
    const vvpEnd: PointSize = { x: offsetLeft + width, y: offsetTop + height };

    // Virtual Element Point
    const vep0: PointSize = { x: elem.x * scale, y: elem.y * scale };
    const vep1: PointSize = { x: (elem.x + elem.w) * scale, y: elem.y * scale };
    const vep2: PointSize = { x: (elem.x + elem.w) * scale, y: (elem.y + elem.h) * scale };
    const vep3: PointSize = { x: elem.x * scale, y: (elem.y + elem.h) * scale };
    // const vepStart: PointSize = { x: elem.x * scale, y: elem.y * scale };
    // const vepEnd: PointSize = { x: (elem.x + elem.w) * scale, y: (elem.y + elem.w) * scale };

    const isPointInRect = (p: PointSize) => {
      return p.x >= vvpStart.x && p.x <= vvpEnd.x && p.y >= vvpStart.y && p.y <= vvpEnd.y;
    };
    if (isPointInRect(vep0) || isPointInRect(vep1) || isPointInRect(vep2) || isPointInRect(vep3)) {
      return true;
    }
    return false;
  }

  isPointInElement(p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean {
    const { scale = 1, offsetTop = 0, offsetLeft = 0 } = scaleInfo;
    // Virtual Point
    const vp: PointSize = {
      x: p.x + offsetLeft,
      y: p.y + offsetTop
    };

    // Virtual Element Point
    const vepStart: PointSize = { x: elem.x * scale, y: elem.y * scale };
    const vepEnd: PointSize = { x: (elem.x + elem.w) * scale, y: (elem.y + elem.w) * scale };
    if (vp.x >= vepStart.x && vp.x <= vepEnd.x && vp.y >= vepStart.y && vp.y <= vepEnd.y) {
      return true;
    }
    return false;
  }

  getPointElement(p: Point, data: Data, scaleInfo: ViewScaleInfo): { index: number; element: null | Element<ElementType> } {
    const result: { index: number; element: null | Element<ElementType> } = {
      index: -1,
      element: null
    };
    for (let i = 0; i < data.elements.length; i++) {
      const elem = data.elements[i];
      if (this.isPointInElement(p, elem, scaleInfo)) {
        result.index = i;
        result.element = elem;
        break;
      }
    }
    return result;
  }

  pointToViewPoint(p: Point): Point {
    // TODO
    return {};
  }
}
