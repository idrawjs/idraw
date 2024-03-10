import {
  Point,
  PointSize,
  Data,
  ViewScaleInfo,
  ViewSizeInfo,
  Element,
  ElementType,
  ElementSize,
  ViewContext2D,
  ViewRectVertexes,
  ViewRectInfo,
  ViewRectInfoMap
} from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import { checkRectIntersect } from './rect';
import { calcElementVertexesInGroup } from './vertex';
import { getCenterFromTwoPoints } from './point';

export function calcViewScaleInfo(info: { scale: number; offsetX: number; offsetY: number }, opts: { viewSizeInfo: ViewSizeInfo }): ViewScaleInfo {
  const { scale, offsetX, offsetY } = info;
  const { viewSizeInfo } = opts;
  const { width, height, contextWidth, contextHeight } = viewSizeInfo;

  const w = contextWidth * scale;
  const h = contextHeight * scale;
  const offsetLeft = 0 - offsetX * scale;
  const offsetTop = 0 - offsetY * scale;
  const offsetRight = width - (w + offsetLeft / scale);
  const offsetBottom = height - (h + offsetTop / scale);
  const newScaleInfo: ViewScaleInfo = {
    scale,
    offsetLeft,
    offsetTop,
    offsetRight,
    offsetBottom
  };
  return newScaleInfo;
}

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
  const { viewScaleInfo } = opts;
  const { x, y, w, h, angle } = size;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  const newSize = {
    x: x * scale + offsetLeft,
    y: y * scale + offsetTop,
    w: w * scale,
    h: h * scale,
    angle
  };
  return newSize;
}

export function calcViewPointSize(size: PointSize, opts: { viewScaleInfo: ViewScaleInfo }): PointSize {
  const { viewScaleInfo } = opts;
  const { x, y } = size;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  const newSize = {
    x: x * scale + offsetLeft,
    y: y * scale + offsetTop
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
          if (child?.operations?.invisible === true) {
            continue;
          }
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
    if (elem?.operations?.invisible === true) {
      continue;
    }
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

export function calcElementOriginRectInfo(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
  }
): ViewRectInfo {
  const { groupQueue } = opts;

  const vertexes = calcElementVertexesInGroup(elemSize, { groupQueue }) as ViewRectVertexes;

  const top = getCenterFromTwoPoints(vertexes[0], vertexes[1]);
  const right = getCenterFromTwoPoints(vertexes[1], vertexes[2]);
  const bottom = getCenterFromTwoPoints(vertexes[2], vertexes[3]);
  const left = getCenterFromTwoPoints(vertexes[3], vertexes[0]);

  const topLeft = vertexes[0];
  const topRight = vertexes[1];
  const bottomRight = vertexes[2];
  const bottomLeft = vertexes[3];

  const maxX = Math.max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
  const maxY = Math.max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
  const minX = Math.min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
  const minY = Math.min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
  const center: PointSize = {
    x: (maxX + minX) / 2,
    y: (maxY + minY) / 2
  };

  const rectInfo: ViewRectInfo = {
    center,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    top,
    right,
    left,
    bottom
  };

  return rectInfo;
}

export function calcElementViewRectInfo(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
    viewScaleInfo: ViewScaleInfo;
    range?: boolean;
  }
): ViewRectInfo {
  const { groupQueue, viewScaleInfo, range } = opts;

  // Original RectInfo
  const originRectInfo = calcElementOriginRectInfo(elemSize, { groupQueue });
  const { center, top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight } = originRectInfo;

  // View RectInfo
  const viewRectInfo: ViewRectInfo = {
    center: calcViewPointSize(center, { viewScaleInfo }),
    topLeft: calcViewPointSize(topLeft, { viewScaleInfo }),
    topRight: calcViewPointSize(topRight, { viewScaleInfo }),
    bottomLeft: calcViewPointSize(bottomLeft, { viewScaleInfo }),
    bottomRight: calcViewPointSize(bottomRight, { viewScaleInfo }),
    top: calcViewPointSize(top, { viewScaleInfo }),
    right: calcViewPointSize(right, { viewScaleInfo }),
    left: calcViewPointSize(left, { viewScaleInfo }),
    bottom: calcViewPointSize(bottom, { viewScaleInfo })
  };

  if (range === true) {
    // Range RectInfo
    const viewMaxX = Math.max(viewRectInfo.topLeft.x, viewRectInfo.topRight.x, viewRectInfo.bottomRight.x, viewRectInfo.bottomLeft.x);
    const viewMaxY = Math.max(viewRectInfo.topLeft.y, viewRectInfo.topRight.y, viewRectInfo.bottomRight.y, viewRectInfo.bottomLeft.y);
    const viewMinX = Math.min(viewRectInfo.topLeft.x, viewRectInfo.topRight.x, viewRectInfo.bottomRight.x, viewRectInfo.bottomLeft.x);
    const viewMinY = Math.min(viewRectInfo.topLeft.y, viewRectInfo.topRight.y, viewRectInfo.bottomRight.y, viewRectInfo.bottomLeft.y);

    const rangeCenter = { x: viewRectInfo.center.x, y: viewRectInfo.center.y };
    const rangeTopLeft = { x: viewMinX, y: viewMinY };
    const rangeTopRight = { x: viewMaxX, y: viewMinY };
    const rangeBottomRight = { x: viewMaxX, y: viewMaxY };
    const rangeBottomLeft = { x: viewMinX, y: viewMaxY };

    const rangeTop = getCenterFromTwoPoints(rangeTopLeft, rangeTopRight);
    const rangeBottom = getCenterFromTwoPoints(rangeBottomLeft, rangeBottomRight);
    const rangeLeft = getCenterFromTwoPoints(rangeTopLeft, rangeBottomLeft);
    const rangeRight = getCenterFromTwoPoints(rangeTopRight, rangeBottomRight);

    const rangeRectInfo: ViewRectInfo = {
      center: rangeCenter,
      topLeft: rangeTopLeft,
      topRight: rangeTopRight,
      bottomLeft: rangeBottomLeft,
      bottomRight: rangeBottomRight,
      top: rangeTop,
      right: rangeRight,
      left: rangeLeft,
      bottom: rangeBottom
    };
    return rangeRectInfo;
  }

  return viewRectInfo;
}

export function calcElementViewRectInfoMap(
  elemSize: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
    viewScaleInfo: ViewScaleInfo;
  }
): ViewRectInfoMap {
  const { groupQueue, viewScaleInfo } = opts;

  // Original RectInfo
  const originRectInfo = calcElementOriginRectInfo(elemSize, { groupQueue });
  const { center, top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight } = originRectInfo;

  // View RectInfo
  const viewRectInfo: ViewRectInfo = {
    center: calcViewPointSize(center, { viewScaleInfo }),
    topLeft: calcViewPointSize(topLeft, { viewScaleInfo }),
    topRight: calcViewPointSize(topRight, { viewScaleInfo }),
    bottomLeft: calcViewPointSize(bottomLeft, { viewScaleInfo }),
    bottomRight: calcViewPointSize(bottomRight, { viewScaleInfo }),
    top: calcViewPointSize(top, { viewScaleInfo }),
    right: calcViewPointSize(right, { viewScaleInfo }),
    left: calcViewPointSize(left, { viewScaleInfo }),
    bottom: calcViewPointSize(bottom, { viewScaleInfo })
  };

  // Range RectInfo
  const viewMaxX = Math.max(viewRectInfo.topLeft.x, viewRectInfo.topRight.x, viewRectInfo.bottomRight.x, viewRectInfo.bottomLeft.x);
  const viewMaxY = Math.max(viewRectInfo.topLeft.y, viewRectInfo.topRight.y, viewRectInfo.bottomRight.y, viewRectInfo.bottomLeft.y);
  const viewMinX = Math.min(viewRectInfo.topLeft.x, viewRectInfo.topRight.x, viewRectInfo.bottomRight.x, viewRectInfo.bottomLeft.x);
  const viewMinY = Math.min(viewRectInfo.topLeft.y, viewRectInfo.topRight.y, viewRectInfo.bottomRight.y, viewRectInfo.bottomLeft.y);

  const rangeCenter = { x: viewRectInfo.center.x, y: viewRectInfo.center.y };
  const rangeTopLeft = { x: viewMinX, y: viewMinY };
  const rangeTopRight = { x: viewMaxX, y: viewMinY };
  const rangeBottomRight = { x: viewMaxX, y: viewMaxY };
  const rangeBottomLeft = { x: viewMinX, y: viewMaxY };

  const rangeTop = getCenterFromTwoPoints(rangeTopLeft, rangeTopRight);
  const rangeBottom = getCenterFromTwoPoints(rangeBottomLeft, rangeBottomRight);
  const rangeLeft = getCenterFromTwoPoints(rangeTopLeft, rangeBottomLeft);
  const rangeRight = getCenterFromTwoPoints(rangeTopRight, rangeBottomRight);

  const rangeRectInfo: ViewRectInfo = {
    center: rangeCenter,
    topLeft: rangeTopLeft,
    topRight: rangeTopRight,
    bottomLeft: rangeBottomLeft,
    bottomRight: rangeBottomRight,
    top: rangeTop,
    right: rangeRight,
    left: rangeLeft,
    bottom: rangeBottom
  };

  return {
    originRectInfo,
    viewRectInfo,
    rangeRectInfo
  };
}
