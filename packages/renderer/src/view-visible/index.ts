import { Elements, ViewScaleInfo, ViewSizeInfo, ViewRectInfo, VirtualFlatItemMap, ViewContext2D } from '@idraw/types';
import { calcElementCenter } from '@idraw/util';
import { elementsToVirtualFlatMap } from '../virtual-flat';

export function sortElementsViewVisiableInfoMap(
  elements: Elements,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    tempContext: ViewContext2D;
  }
): {
  virtualFlatItemMap: VirtualFlatItemMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const { viewScaleInfo, viewSizeInfo, tempContext } = opts;
  const visibleInfoMap: VirtualFlatItemMap = elementsToVirtualFlatMap(elements, { tempContext });
  return updateVirtualFlatItemMapStatus(visibleInfoMap, { viewScaleInfo, viewSizeInfo });
}

function isRangeRectInfoCollide(info1: ViewRectInfo, info2: ViewRectInfo): boolean {
  const rect1MinX = Math.min(info1.topLeft.x, info1.topRight.x, info1.bottomLeft.x, info1.bottomRight.x);
  const rect1MaxX = Math.max(info1.topLeft.x, info1.topRight.x, info1.bottomLeft.x, info1.bottomRight.x);
  const rect1MinY = Math.min(info1.topLeft.y, info1.topRight.y, info1.bottomLeft.y, info1.bottomRight.y);
  const rect1MaxY = Math.max(info1.topLeft.y, info1.topRight.y, info1.bottomLeft.y, info1.bottomRight.y);

  const rect2MinX = Math.min(info2.topLeft.x, info2.topRight.x, info2.bottomLeft.x, info2.bottomRight.x);
  const rect2MaxX = Math.max(info2.topLeft.x, info2.topRight.x, info2.bottomLeft.x, info2.bottomRight.x);
  const rect2MinY = Math.min(info2.topLeft.y, info2.topRight.y, info2.bottomLeft.y, info2.bottomRight.y);
  const rect2MaxY = Math.max(info2.topLeft.y, info2.topRight.y, info2.bottomLeft.y, info2.bottomRight.y);

  if (
    (rect1MinX <= rect2MaxX && rect1MaxX >= rect2MinX && rect1MinY <= rect2MaxY && rect1MaxY >= rect2MinY) ||
    (rect2MaxX <= rect1MaxY && rect2MaxX >= rect1MaxY && rect2MaxX <= rect1MaxY && rect2MaxX >= rect1MaxY)
  ) {
    return true;
  }

  return false;
}

// function logVirtualFlatItemMapStatus(virtualFlatItemMap: VirtualFlatItemMap) {
//   console.log('------------------------------------------------');
//   Object.keys(virtualFlatItemMap).forEach((uuid) => {
//     const item = virtualFlatItemMap[uuid];
//     const info = item.originRectInfo;
//     const rect = {
//       x: info.topLeft.x,
//       y: info.topRight.y,
//       w: info.bottomRight.x - info.topLeft.x,
//       h: info.bottomRight.y - info.topLeft.y
//     };
//     console.log('view: ', uuid, item.isVisibleInView, rect);
//   });
// }

export function updateVirtualFlatItemMapStatus(
  virtualFlatItemMap: VirtualFlatItemMap,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): {
  virtualFlatItemMap: VirtualFlatItemMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const canvasRectInfo = calcVisibleOriginCanvasRectInfo(opts);
  let visibleCount = 0;
  let invisibleCount = 0;
  Object.keys(virtualFlatItemMap).forEach((uuid) => {
    const info = virtualFlatItemMap[uuid];
    info.isVisibleInView = isRangeRectInfoCollide(info.rangeRectInfo, canvasRectInfo);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    info.isVisibleInView ? visibleCount++ : invisibleCount++;
  });

  // logVirtualFlatItemMapStatus(virtualFlatItemMap);

  return { virtualFlatItemMap, visibleCount, invisibleCount };
}

export function calcVisibleOriginCanvasRectInfo(opts: {
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): ViewRectInfo {
  const { viewScaleInfo, viewSizeInfo } = opts;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;
  const { width, height } = viewSizeInfo;

  const x = 0 - offsetLeft / scale;
  const y = 0 - offsetTop / scale;
  const w = width / scale;
  const h = height / scale;

  const center = calcElementCenter({ x, y, w, h });
  const topLeft = { x, y };
  const topRight = { x: x + w, y };
  const bottomLeft = { x, y: y + h };
  const bottomRight = { x: x + w, y: y + h };
  const left = { x, y: center.y };
  const top = { x: center.x, y };
  const right = { x: x + w, y: center.y };
  const bottom = { x: center.x, y: y + h };
  const rectInfo: ViewRectInfo = {
    center,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    left,
    top,
    right,
    bottom
  };
  return rectInfo;
}

// export function isInVisiableView(rangeRectInfo: ViewRectInfo) {}
