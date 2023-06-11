import { Point, Data, ViewScaleInfo, ViewSizeInfo, Element, ElementType, ElementSize } from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import { Context2D } from './context2d';
import { checkRectIntersect } from './rect';

export function viewScale(num: number, opts: { prevViewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewScaleInfo {
  const scale = num;
  const { prevViewScaleInfo, viewSizeInfo } = opts;
  const { width, height, contextWidth, contextHeight } = viewSizeInfo;
  let offsetLeft = 0;
  let offsetRight = 0;
  let offsetTop = 0;
  let offsetBottom = 0;

  if (contextWidth * scale < width) {
    offsetLeft = offsetRight = (width - contextWidth * scale) / 2;
  } else if (contextWidth * scale > width) {
    if (prevViewScaleInfo.offsetLeft < 0) {
      offsetLeft = (prevViewScaleInfo.offsetLeft / prevViewScaleInfo.scale) * scale;
      offsetRight = 0 - (contextWidth * scale - width - Math.abs(offsetLeft));
    }
  }

  if (contextHeight * scale < height) {
    offsetTop = offsetBottom = (height - contextHeight * scale) / 2;
  } else if (contextHeight * scale > height) {
    if (prevViewScaleInfo.offsetTop < 0) {
      offsetTop = (prevViewScaleInfo.offsetTop / prevViewScaleInfo.scale) * scale;
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

export function viewScroll(opts: { moveX?: number; moveY?: number }, viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
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

export function calcElementSize(size: ElementSize, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ElementSize {
  const { viewScaleInfo, viewSizeInfo } = opts;
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

export function isViewPointInElement(
  p: Point,
  opts: { context2d: Context2D; element: Element<ElementType>; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { context2d: ctx, element: elem, viewScaleInfo, viewSizeInfo } = opts;

  const { angle = 0 } = elem;
  const { x, y, w, h } = calcElementSize(elem, { viewScaleInfo, viewSizeInfo });
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

export function getViewPointAtElement(
  p: Point,
  opts: {
    context2d: Context2D;
    data: Data;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
): { index: number; element: null | Element<ElementType> } {
  const { context2d: ctx, data, viewScaleInfo, viewSizeInfo } = opts;
  const result: { index: number; element: null | Element<ElementType> } = {
    index: -1,
    element: null
  };
  for (let i = data.elements.length - 1; i >= 0; i--) {
    const elem = data.elements[i];
    if (isViewPointInElement(p, { context2d: ctx, element: elem, viewScaleInfo, viewSizeInfo })) {
      result.index = i;
      result.element = elem;
      break;
    }
  }
  return result;
}

export function isElementInView(elem: ElementSize, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): boolean {
  const { viewSizeInfo, viewScaleInfo } = opts;
  const { width, height } = viewSizeInfo;
  const { angle } = elem;
  const { x, y, w, h } = calcElementSize(elem, { viewScaleInfo, viewSizeInfo });
  const ves = rotateElementVertexes({ x, y, w, h, angle });
  const viewSize = { x: 0, y: 0, w: width, h: height };

  const elemStartX = Math.min(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const elemStartY = Math.min(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const elemEndX = Math.max(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const elemEndY = Math.max(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const elemSize = { x: elemStartX, y: elemStartY, w: elemEndX - elemStartX, h: elemEndY - elemStartY };
  return checkRectIntersect(viewSize, elemSize);
}
