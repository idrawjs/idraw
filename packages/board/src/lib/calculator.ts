import type {
  Data,
  PointSize,
  Point,
  Element,
  ElementType,
  ViewCalculator,
  ViewCalculatorOptions,
  ViewScaleInfo,
  ElementSize,
  ViewSizeInfo,
  ViewContext2D
} from '@idraw/types';
import {} from '@idraw/util';

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

  viewScale(num: number, prevScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = num;
    let offsetLeft = 0;
    let offsetRight = 0;
    let offsetTop = 0;
    let offsetBottom = 0;
    const { width, height, contextWidth, contextHeight } = viewSizeInfo;

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
    let offsetLeft = scaleInfo.offsetLeft;
    let offsetRight = scaleInfo.offsetRight;
    let offsetTop = scaleInfo.offsetTop;
    let offsetBottom = scaleInfo.offsetBottom;
    const { width, height, contextWidth, contextHeight } = viewSizeInfo;
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

  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo): ElementSize {
    const { x, y, w, h, angle } = size;
    const { scale, offsetTop, offsetLeft } = scaleInfo;
    return {
      x: x * scale + offsetLeft,
      y: y * scale + offsetTop,
      w: w * scale,
      h: h * scale,
      angle
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
    const vvpStart: PointSize = { x: 0 - offsetLeft, y: 0 - offsetTop };
    const vvpEnd: PointSize = { x: 0 - offsetLeft + width, y: Math.abs(offsetTop) + height };

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

  isPointInElement(ctx: ViewContext2D, p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean {
    const { scale = 1, offsetTop = 0, offsetLeft = 0 } = scaleInfo;
    // Virtual Point
    const vp: PointSize = {
      x: p.x - offsetLeft,
      y: p.y - offsetTop
    };

    // Virtual Element Point
    const vepStart: PointSize = { x: elem.x * scale, y: elem.y * scale };
    const vepEnd: PointSize = { x: (elem.x + elem.w) * scale, y: (elem.y + elem.w) * scale };
    if (vp.x >= vepStart.x && vp.x <= vepEnd.x && vp.y >= vepStart.y && vp.y <= vepEnd.y) {
      return true;
    }
    return false;
  }

  getPointElement(ctx: ViewContext2D, p: Point, data: Data, scaleInfo: ViewScaleInfo): { index: number; element: null | Element<ElementType> } {
    const result: { index: number; element: null | Element<ElementType> } = {
      index: -1,
      element: null
    };
    for (let i = 0; i < data.elements.length; i++) {
      const elem = data.elements[i];
      if (this.isPointInElement(ctx, p, elem, scaleInfo)) {
        result.index = i;
        result.element = elem;
        break;
      }
    }
    return result;
  }

  rotateElementSize(elemSize: ElementSize): PointSize[] {
    // const { x, y, w, h, angle = 0 } = elemSize;
    // const pointSizes: PointSize[] = [];

    return [];
  }

  // pointToViewPoint(p: Point): Point {
  //   // TODO
  //   return {};
  // }
}
