import { Point, PointSize, Data, ViewScaleInfo, ViewSizeInfo, Element, ElementType, ElementSize, ViewContext2D, ViewRectVertexes } from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import { checkRectIntersect } from './rect';

export function viewScale(opts: { scale: number; point: PointSize; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): {
  moveX: number;
  moveY: number;
} {
  const { scale, point, viewScaleInfo: prevViewScaleInfo } = opts;
  const { offsetLeft, offsetTop } = prevViewScaleInfo;
  const scaleDiff = scale / prevViewScaleInfo.scale;
  const x0 = point.x;
  const y0 = point.y;
  const moveX = x0 - x0 * scaleDiff + (offsetLeft * scaleDiff - offsetLeft);
  const moveY = y0 - y0 * scaleDiff + (offsetTop * scaleDiff - offsetTop);
  return {
    moveX,
    moveY
  };
}

export function viewScroll(opts: { moveX?: number; moveY?: number; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewScaleInfo {
  const { moveX = 0, moveY = 0, viewScaleInfo, viewSizeInfo } = opts;

  const { scale } = viewScaleInfo;
  const { width, height, contextWidth, contextHeight } = viewSizeInfo;
  let offsetLeft = viewScaleInfo.offsetLeft;
  let offsetRight = viewScaleInfo.offsetRight;
  let offsetTop = viewScaleInfo.offsetTop;
  let offsetBottom = viewScaleInfo.offsetBottom;

  offsetLeft += moveX;
  offsetTop += moveY;

  const w = contextWidth * scale;
  const h = contextHeight * scale;

  offsetRight = width - (w + offsetLeft);
  offsetBottom = height - (h + offsetTop);

  return {
    scale,
    offsetTop,
    offsetLeft,
    offsetRight,
    offsetBottom
  };
}

export function calcViewElementSize(size: ElementSize, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ElementSize {
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

export function calcViewPointSize(size: PointSize, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): PointSize {
  const { viewScaleInfo, viewSizeInfo } = opts;
  const { x, y } = size;
  const { contextX = 0, contextY = 0 } = viewSizeInfo;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  const newSize = {
    x: x * scale + offsetLeft - contextX,
    y: y * scale + offsetTop - contextY
  };
  return newSize;
}

export function calcViewVertexes(vertexes: ViewRectVertexes, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewRectVertexes {
  return [
    calcViewPointSize(vertexes[0], opts),
    calcViewPointSize(vertexes[1], opts),
    calcViewPointSize(vertexes[2], opts),
    calcViewPointSize(vertexes[3], opts)
  ];
}

export function isViewPointInElement(
  p: Point,
  opts: { context2d: ViewContext2D; element: ElementSize; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { context2d: ctx, element: elem, viewScaleInfo, viewSizeInfo } = opts;

  const { angle = 0 } = elem;
  const { x, y, w, h } = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo });
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
    context2d: ViewContext2D;
    data: Data;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    groupQueue?: Element<'group'>[];
  }
): { index: number; element: null | Element<ElementType>; groupQueueIndex: number } {
  const { context2d: ctx, data, viewScaleInfo, viewSizeInfo, groupQueue } = opts;

  const result: { index: number; element: null | Element<ElementType>; groupQueueIndex: number } = {
    index: -1,
    element: null,
    groupQueueIndex: -1
  };

  if (groupQueue && Array.isArray(groupQueue) && groupQueue?.length > 0) {
    // const lastGroup = groupQueue[groupQueue.length - 1];

    for (let gIdx = groupQueue.length - 1; gIdx >= 0; gIdx--) {
      let totalX = 0;
      let totalY = 0;
      let totalAngle = 0;
      for (let i = 0; i <= gIdx; i++) {
        totalX += groupQueue[i].x;
        totalY += groupQueue[i].y;
        totalAngle += groupQueue[i].angle || 0;
      }

      const lastGroup = groupQueue[gIdx];

      if (lastGroup && lastGroup.type === 'group' && Array.isArray(lastGroup.detail?.children)) {
        for (let i = 0; i < lastGroup.detail.children.length; i++) {
          const child = lastGroup.detail.children[i];
          if (child) {
            const elemSize = {
              x: totalX + child.x,
              y: totalY + child.y,
              w: child.w,
              h: child.h,
              angle: totalAngle + (child.angle || 0)
            };
            if (isViewPointInElement(p, { context2d: ctx, element: elemSize, viewScaleInfo, viewSizeInfo })) {
              result.element = child;
              if (gIdx < groupQueue.length - 1 || child.type !== 'group') {
                result.groupQueueIndex = gIdx;
              }
              break;
            }
          } else {
            break;
          }
        }
      }
      if (result.element) {
        break;
      }
    }
  }
  if (result.element) {
    return result;
  }

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
  const { x, y, w, h } = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo });
  const ves = rotateElementVertexes({ x, y, w, h, angle });
  const viewSize = { x: 0, y: 0, w: width, h: height };

  const elemStartX = Math.min(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const elemStartY = Math.min(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const elemEndX = Math.max(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const elemEndY = Math.max(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const elemSize = { x: elemStartX, y: elemStartY, w: elemEndX - elemStartX, h: elemEndY - elemStartY };
  return checkRectIntersect(viewSize, elemSize);
}
