import type { Data, Point, Element, ElementType, ViewCalculator, ViewCalculatorOptions, ViewScaleInfo, ElementSize, ViewSizeInfo } from '@idraw/types';
import { rotateElementVertexes } from '@idraw/util';

export class Calculator implements ViewCalculator {
  private _opts: ViewCalculatorOptions;

  constructor(opts: ViewCalculatorOptions) {
    this._opts = opts;
  }

  viewScale(num: number, prevScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = num;

    const { width, height, contextX, contextY, contextWidth, contextHeight } = viewSizeInfo;
    let offsetLeft = 0;
    let offsetRight = 0;
    let offsetTop = 0;
    let offsetBottom = 0;

    if (contextWidth * scale < width) {
      offsetLeft = offsetRight = (width - contextWidth * scale) / 2;
    } else if (contextWidth * scale > width) {
      if (prevScaleInfo.offsetLeft < 0) {
        offsetLeft = (prevScaleInfo.offsetLeft / prevScaleInfo.scale) * scale;
        offsetRight = 0 - (contextWidth * scale - width - Math.abs(offsetLeft));
      }
    }

    if (contextHeight * scale < height) {
      offsetTop = offsetBottom = (height - contextHeight * scale) / 2;
    } else if (contextHeight * scale > height) {
      if (prevScaleInfo.offsetTop < 0) {
        offsetTop = (prevScaleInfo.offsetTop / prevScaleInfo.scale) * scale;
        offsetBottom = 0 - (contextHeight * scale - height - Math.abs(offsetTop));
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

  viewScroll(opts: { moveX?: number; moveY?: number }, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = scaleInfo.scale;
    const { moveX, moveY } = opts;
    const { width, height, contextWidth, contextHeight, contextX, contextY } = viewSizeInfo;
    let offsetLeft = scaleInfo.offsetLeft;
    let offsetRight = scaleInfo.offsetRight;
    let offsetTop = scaleInfo.offsetTop;
    let offsetBottom = scaleInfo.offsetBottom;
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

  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ElementSize {
    const { x, y, w, h, angle } = size;
    const { contextX = 0, contextY = 0 } = viewSizeInfo;
    const { scale, offsetTop, offsetLeft } = scaleInfo;
    return {
      x: x * scale + offsetLeft - contextX,
      y: y * scale + offsetTop - contextY,
      w: w * scale,
      h: h * scale,
      angle
    };

    // const { x, y, w, h, angle } = size;
    // const { scale, offsetTop, offsetLeft } = scaleInfo;
    // return {
    //   x: x * scale + offsetLeft,
    //   y: y * scale + offsetTop,
    //   w: w * scale,
    //   h: h * scale,
    //   angle
    // };
  }

  isElementInView(elem: ElementSize, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): boolean {
    const { width, height } = viewSizeInfo;
    const { angle } = elem;
    const { x, y, w, h } = this.elementSize(elem, scaleInfo, viewSizeInfo);
    const vertexes = rotateElementVertexes({ x, y, w, h, angle });
    for (let i = 0; i < vertexes.length; i++) {
      const v = vertexes[i];
      if (v.x >= 0 && v.x <= width && v.y >= 0 && v.y <= height) {
        return true;
      }
    }
    return false;
  }

  isPointInElement(p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): boolean {
    const ctx = this._opts.viewContent.boardContext;
    const { angle = 0 } = elem;
    const { x, y, w, h } = this.elementSize(elem, scaleInfo, viewSize);
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

  getPointElement(p: Point, data: Data, scaleInfo: ViewScaleInfo, viewSize: ViewSizeInfo): { index: number; element: null | Element<ElementType> } {
    const result: { index: number; element: null | Element<ElementType> } = {
      index: -1,
      element: null
    };
    for (let i = data.elements.length - 1; i >= 0; i--) {
      const elem = data.elements[i];
      if (this.isPointInElement(p, elem, scaleInfo, viewSize)) {
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
