import {
  Point,
  Data,
  ViewScaleInfo,
  ViewSizeInfo,
  StrictMaterial,
  MaterialType,
  MaterialSize,
  ViewContext2D,
  ViewRectVertexes,
  BoundingInfo,
} from '@idraw/types';
import { rotateMaterialVertexes } from './rotate';
import { checkRectIntersect } from './rect';
import { calcMaterialVertexesInGroup, calcMaterialVertexes } from './vertex';
import { getCenterFromTwoPoints } from './point';

export function calcViewScaleInfo(
  info: { scale: number; offsetX: number; offsetY: number },
  opts: { viewSizeInfo: ViewSizeInfo }
): ViewScaleInfo {
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
    offsetBottom,
  };
  return newScaleInfo;
}

export function viewScale(opts: {
  scale: number;
  point: Point;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): {
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
    moveY,
  };
}

export function viewScroll(opts: {
  moveX?: number;
  moveY?: number;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): ViewScaleInfo {
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
    offsetBottom,
  };
}

export function calcViewMaterialSize(
  size: MaterialSize,
  opts: { viewScaleInfo: Partial<ViewScaleInfo> }
): MaterialSize {
  const { viewScaleInfo } = opts;
  const { id, x, y, width, height, angle } = size;
  const { scale = 1, offsetTop = 0, offsetLeft = 0 } = viewScaleInfo;

  const newSize: MaterialSize = {
    id,
    x: x * scale + offsetLeft,
    y: y * scale + offsetTop,
    width: width * scale,
    height: height * scale,
    angle,
  };
  return newSize;
}

export function calcViewPoint(size: Point, opts: { viewScaleInfo: ViewScaleInfo }): Point {
  const { viewScaleInfo } = opts;
  const { x, y } = size;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  const newSize = {
    x: x * scale + offsetLeft,
    y: y * scale + offsetTop,
  };
  return newSize;
}

export function calcPointFromView(viewPoint: Point, opts: { viewScaleInfo: ViewScaleInfo }): Point {
  const { viewScaleInfo } = opts;
  const { x, y } = viewPoint;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  const newSize = {
    x: (x - offsetLeft) / scale,
    y: (y - offsetTop) / scale,
  };
  return newSize;
}

export function calcViewVertexes(
  vertexes: ViewRectVertexes,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): ViewRectVertexes {
  return [
    calcViewPoint(vertexes[0], opts),
    calcViewPoint(vertexes[1], opts),
    calcViewPoint(vertexes[2], opts),
    calcViewPoint(vertexes[3], opts),
  ];
}

/**
 * @deprecated
 */
export function isViewPointInMaterial(
  p: Point,
  opts: { context2d: ViewContext2D; material: MaterialSize; viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { context2d: ctx, material: mtrl, viewScaleInfo } = opts;

  const { angle = 0 } = mtrl;
  const { x, y, width, height } = calcViewMaterialSize(mtrl, { viewScaleInfo });
  const vertexes = rotateMaterialVertexes({ x, y, width, height, angle });
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

export function isViewPointInMaterialSize(
  p: Point,
  mtrlSize: MaterialSize,
  opts?: {
    includeBorder?: boolean;
  }
): boolean {
  const vertexes = calcMaterialVertexes(mtrlSize);
  return isViewPointInVertexes(p, vertexes, opts);
}

export function isViewPointInVertexes(
  p: Point,
  vertexes: ViewRectVertexes,
  opts?: {
    includeBorder?: boolean;
  }
): boolean {
  const xList = [vertexes[0].x, vertexes[1].x, vertexes[2].x, vertexes[3].x];
  const yList = [vertexes[0].y, vertexes[1].y, vertexes[2].y, vertexes[3].y];
  const mixX = Math.min(...xList);
  const maxX = Math.max(...xList);
  const mixY = Math.min(...yList);
  const maxY = Math.max(...yList);

  if (p.x > mixX && p.x < maxX && p.y > mixY && p.y < maxY) {
    return true;
  }
  if (opts?.includeBorder === true && (p.x === mixX || p.x === maxX || p.y === mixY || p.y === maxY)) {
    return true;
  }
  return false;
}

export function getViewPointAtMaterial(
  p: Point,
  opts: {
    context2d: ViewContext2D;
    data: Data;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    groupQueue?: StrictMaterial<'group'>[];
  }
): { index: number; material: null | StrictMaterial<MaterialType>; groupQueueIndex: number } {
  const { context2d: ctx, data, viewScaleInfo, viewSizeInfo, groupQueue } = opts;

  const result: { index: number; material: null | StrictMaterial<MaterialType>; groupQueueIndex: number } = {
    index: -1,
    material: null,
    groupQueueIndex: -1,
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

      if (lastGroup && lastGroup.type === 'group' && Array.isArray(lastGroup?.children)) {
        for (let i = 0; i < lastGroup.children.length; i++) {
          const child = lastGroup.children[i];
          if (child?.operations?.invisible === true) {
            continue;
          }
          if (child) {
            const mtrlSize: MaterialSize = {
              x: totalX + child.x,
              y: totalY + child.y,
              width: child.width,
              height: child.height,
              angle: totalAngle + (child.angle || 0),
            };
            if (isViewPointInMaterial(p, { context2d: ctx, material: mtrlSize, viewScaleInfo, viewSizeInfo })) {
              result.material = child;
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
      if (result.material) {
        break;
      }
    }
  }
  if (result.material) {
    return result;
  }

  for (let i = data.materials.length - 1; i >= 0; i--) {
    const mtrl = data.materials[i];
    if (mtrl?.operations?.invisible === true) {
      continue;
    }
    if (isViewPointInMaterial(p, { context2d: ctx, material: mtrl, viewScaleInfo, viewSizeInfo })) {
      result.index = i;
      result.material = mtrl;
      break;
    }
  }
  return result;
}

/**
 * @deprecated
 */
export function isMaterialInView(
  mtrl: MaterialSize,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): boolean {
  const { viewSizeInfo, viewScaleInfo } = opts;
  const { width, height } = viewSizeInfo;
  const { angle } = mtrl;
  const { x, y, width: w, height: h } = calcViewMaterialSize(mtrl, { viewScaleInfo });
  const ves = rotateMaterialVertexes({ x, y, width: w, height: h, angle });
  const viewSize = { x: 0, y: 0, width, height };

  const mtrlStartX = Math.min(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const mtrlStartY = Math.min(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const mtrlEndX = Math.max(ves[0].x, ves[1].x, ves[2].x, ves[3].x);
  const mtrlEndY = Math.max(ves[0].y, ves[1].y, ves[2].y, ves[3].y);
  const mtrlSize = { x: mtrlStartX, y: mtrlStartY, width: mtrlEndX - mtrlStartX, height: mtrlEndY - mtrlStartY };
  return checkRectIntersect(viewSize, mtrlSize);
}

export function calcMaterialBoundingInfo(
  mtrlSize: MaterialSize,
  opts: {
    groupQueue: StrictMaterial<'group'>[];
  }
): BoundingInfo {
  const { groupQueue } = opts;

  const vertexes = calcMaterialVertexesInGroup(mtrlSize, { groupQueue }) as ViewRectVertexes;

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
  const center: Point = {
    x: (maxX + minX) / 2,
    y: (maxY + minY) / 2,
  };

  const boundingBox: BoundingInfo = {
    center,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    top,
    right,
    left,
    bottom,
  };

  return boundingBox;
}

export function boundingInfoToRangeBoundingInfo(boundingInfo: BoundingInfo): BoundingInfo {
  const rangeMaxX = Math.max(
    boundingInfo.topLeft.x,
    boundingInfo.topRight.x,
    boundingInfo.bottomRight.x,
    boundingInfo.bottomLeft.x
  );
  const rangeMaxY = Math.max(
    boundingInfo.topLeft.y,
    boundingInfo.topRight.y,
    boundingInfo.bottomRight.y,
    boundingInfo.bottomLeft.y
  );
  const rangeMinX = Math.min(
    boundingInfo.topLeft.x,
    boundingInfo.topRight.x,
    boundingInfo.bottomRight.x,
    boundingInfo.bottomLeft.x
  );
  const rangeMinY = Math.min(
    boundingInfo.topLeft.y,
    boundingInfo.topRight.y,
    boundingInfo.bottomRight.y,
    boundingInfo.bottomLeft.y
  );

  const rangeCenter = { x: boundingInfo.center.x, y: boundingInfo.center.y };
  const rangeTopLeft = { x: rangeMinX, y: rangeMinY };
  const rangeTopRight = { x: rangeMaxX, y: rangeMinY };
  const rangeBottomRight = { x: rangeMaxX, y: rangeMaxY };
  const rangeBottomLeft = { x: rangeMinX, y: rangeMaxY };

  const rangeTop = getCenterFromTwoPoints(rangeTopLeft, rangeTopRight);
  const rangeBottom = getCenterFromTwoPoints(rangeBottomLeft, rangeBottomRight);
  const rangeLeft = getCenterFromTwoPoints(rangeTopLeft, rangeBottomLeft);
  const rangeRight = getCenterFromTwoPoints(rangeTopRight, rangeBottomRight);

  const rangeBoundingInfo: BoundingInfo = {
    center: rangeCenter,
    topLeft: rangeTopLeft,
    topRight: rangeTopRight,
    bottomLeft: rangeBottomLeft,
    bottomRight: rangeBottomRight,
    top: rangeTop,
    right: rangeRight,
    left: rangeLeft,
    bottom: rangeBottom,
  };
  return rangeBoundingInfo;
}

export function calcMaterialViewBoundingInfo(
  mtrlSize: MaterialSize,
  opts: {
    groupQueue: StrictMaterial<'group'>[];
    viewScaleInfo: ViewScaleInfo;
    range?: boolean;
  }
): BoundingInfo {
  const { groupQueue, viewScaleInfo, range } = opts;

  // Original BoundingInfo
  const boundingInfo = calcMaterialBoundingInfo(mtrlSize, { groupQueue });
  const { center, top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight } = boundingInfo;

  // View BoundingInfo
  const viewBoundingInfo: BoundingInfo = {
    center: calcViewPoint(center, { viewScaleInfo }),
    topLeft: calcViewPoint(topLeft, { viewScaleInfo }),
    topRight: calcViewPoint(topRight, { viewScaleInfo }),
    bottomLeft: calcViewPoint(bottomLeft, { viewScaleInfo }),
    bottomRight: calcViewPoint(bottomRight, { viewScaleInfo }),
    top: calcViewPoint(top, { viewScaleInfo }),
    right: calcViewPoint(right, { viewScaleInfo }),
    left: calcViewPoint(left, { viewScaleInfo }),
    bottom: calcViewPoint(bottom, { viewScaleInfo }),
  };

  if (range === true) {
    // Range BoundingInfo
    const viewMaxX = Math.max(
      viewBoundingInfo.topLeft.x,
      viewBoundingInfo.topRight.x,
      viewBoundingInfo.bottomRight.x,
      viewBoundingInfo.bottomLeft.x
    );
    const viewMaxY = Math.max(
      viewBoundingInfo.topLeft.y,
      viewBoundingInfo.topRight.y,
      viewBoundingInfo.bottomRight.y,
      viewBoundingInfo.bottomLeft.y
    );
    const viewMinX = Math.min(
      viewBoundingInfo.topLeft.x,
      viewBoundingInfo.topRight.x,
      viewBoundingInfo.bottomRight.x,
      viewBoundingInfo.bottomLeft.x
    );
    const viewMinY = Math.min(
      viewBoundingInfo.topLeft.y,
      viewBoundingInfo.topRight.y,
      viewBoundingInfo.bottomRight.y,
      viewBoundingInfo.bottomLeft.y
    );

    const rangeCenter = { x: viewBoundingInfo.center.x, y: viewBoundingInfo.center.y };
    const rangeTopLeft = { x: viewMinX, y: viewMinY };
    const rangeTopRight = { x: viewMaxX, y: viewMinY };
    const rangeBottomRight = { x: viewMaxX, y: viewMaxY };
    const rangeBottomLeft = { x: viewMinX, y: viewMaxY };

    const rangeTop = getCenterFromTwoPoints(rangeTopLeft, rangeTopRight);
    const rangeBottom = getCenterFromTwoPoints(rangeBottomLeft, rangeBottomRight);
    const rangeLeft = getCenterFromTwoPoints(rangeTopLeft, rangeBottomLeft);
    const rangeRight = getCenterFromTwoPoints(rangeTopRight, rangeBottomRight);

    const rangeBoundingInfo: BoundingInfo = {
      center: rangeCenter,
      topLeft: rangeTopLeft,
      topRight: rangeTopRight,
      bottomLeft: rangeBottomLeft,
      bottomRight: rangeBottomRight,
      top: rangeTop,
      right: rangeRight,
      left: rangeLeft,
      bottom: rangeBottom,
    };
    return rangeBoundingInfo;
  }

  return viewBoundingInfo;
}
