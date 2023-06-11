import type { Data, Point, Element, ElementType, ViewCalculator, ViewCalculatorOptions, ViewScaleInfo, ElementSize, ViewSizeInfo } from '@idraw/types';
import {
  rotateElementVertexes,
  checkRectIntersect,
  viewScale,
  viewScroll,
  calcElementSize,
  isViewPointInElement,
  getViewPointAtElement,
  isElementInView
} from '@idraw/util';

export class Calculator implements ViewCalculator {
  private _opts: ViewCalculatorOptions;

  constructor(opts: ViewCalculatorOptions) {
    this._opts = opts;
  }

  viewScroll(opts: { moveX?: number; moveY?: number }, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = viewScaleInfo.scale;
    const { moveX, moveY } = opts;
    const { width, height, contextWidth, contextHeight } = viewSizeInfo;
    let offsetLeft = viewScaleInfo.offsetLeft;
    let offsetRight = viewScaleInfo.offsetRight;
    let offsetTop = viewScaleInfo.offsetTop;
    let offsetBottom = viewScaleInfo.offsetBottom;
    if (moveX !== undefined && (moveX > 0 || moveX <= 0)) {
      if (contextWidth * scale < width) {
        offsetLeft = offsetRight = (width - contextWidth * scale) / 2;
      } else if (contextWidth * scale > width) {
        if (offsetLeft + moveX >= 0) {
          offsetLeft = 0;
          offsetRight = width - contextWidth * scale;
        } else if (offsetLeft + moveX < width - contextWidth * scale) {
          offsetLeft = width - contextWidth * scale;
          offsetRight = 0;
        } else {
          offsetLeft += moveX;
          offsetRight = width - contextWidth * scale - offsetLeft;
        }
      } else {
        offsetLeft = offsetRight = 0;
      }
    }

    if (moveY !== undefined && (moveY > 0 || moveY <= 0)) {
      if (contextHeight * scale < height) {
        offsetTop = offsetBottom = (height - contextHeight * scale) / 2;
      } else if (contextHeight * scale > height) {
        if (offsetTop + moveY >= 0) {
          offsetTop = 0;
          offsetBottom = height - contextHeight * scale;
        } else if (offsetTop + moveY < height - contextHeight * scale) {
          offsetTop = height - contextHeight * scale;
          offsetBottom = 0;
        } else {
          offsetTop += moveY;
          offsetBottom = height - contextHeight * scale - offsetTop;
        }
      } else {
        offsetTop = offsetBottom = 0;
      }
    }

    return {
      scale,
      offsetTop,
      offsetLeft,
      offsetRight,
      offsetBottom
    };
  }

  elementSize(size: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ElementSize {
    const { x, y, w, h, angle } = size;
    const { contextX = 0, contextY = 0 } = viewSizeInfo;
    const { scale, offsetTop, offsetLeft } = viewScaleInfo;

    const newSize = {
      x: x * scale + offsetLeft - contextX,
      y: y * scale + offsetTop - contextY,
      w: w * scale,
      h: h * scale,
      angle
    };

    return newSize;
  }

  isElementInView(elem: ElementSize, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    const { width, height } = viewSizeInfo;
    const { angle } = elem;
    const { x, y, w, h } = this.elementSize(elem, viewScaleInfo, viewSizeInfo);
    const ves = rotateElementVertexes({ x, y, w, h, angle });
    const viewSize = { x: 0, y: 0, w: width, h: height };

    const elemStartX = Math.min(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
    const elemStartY = Math.min(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
    const elemEndX = Math.max(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
    const elemEndY = Math.max(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
    const elemSize = { x: elemStartX, y: elemStartY, w: elemEndX - elemStartX, h: elemEndY - elemStartY };
    return checkRectIntersect(viewSize, elemSize);
  }

  isPointInElement(p: Point, elem: Element<ElementType>, viewScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): boolean {
    const ctx = this._opts.viewContent.boardContext;
    const { angle = 0 } = elem;
    const { x, y, w, h } = this.elementSize(elem, viewScaleInfo, viewSize);
    const vertexes = rotateElementVertexes({ x, y, w, h, angle });
    if (vertexes.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(vertexes[0].x, vertexes[0].y);
      for (let i = 1; i < vertexes.length; i++) {
        ctx.lineTo(vertexes[i].x, vertexes[i].y);
      }
      ctx.closePath();
    }
    if (ctx.isPointInPath(p.x, p.y)) {
      return true;
    }
    return false;
  }

  getPointElement(p: Point, data: Data, viewScaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): { index: number; element: null | Element<ElementType> } {
    const result: { index: number; element: null | Element<ElementType> } = {
      index: -1,
      element: null
    };
    for (let i = data.elements.length - 1; i >= 0; i--) {
      const elem = data.elements[i];
      if (this.isPointInElement(p, elem, viewScaleInfo, viewSize)) {
        result.index = i;
        result.element = elem;
        break;
      }
    }
    return result;
  }

  // rotateElementSize(elemSize: ElementSize): PointSize[] {
  //   // const { x, y, w, h, angle = 0 } = elemSize;
  //   // const pointSizes: PointSize[] = [];
  //   return [];
  // }

  // pointToViewPoint(p: Point): Point {
  //   // TODO
  //   return {};
  // }
}
