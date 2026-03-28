import { StrictMaterial, ViewScaleInfo, ViewSizeInfo, BoundingInfo, VirtualItemMap, ViewContext2D } from '@idraw/types';
import { calcMaterialCenter } from '@idraw/util';
import { materialsToVirtualFlatMap } from '../virtual';

export function sortMaterialsViewVisiableInfoMap(
  materials: StrictMaterial[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    tempContext: ViewContext2D;
  }
): {
  virtualItemMap: VirtualItemMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const { viewScaleInfo, viewSizeInfo, tempContext } = opts;
  const visibleInfoMap: VirtualItemMap = materialsToVirtualFlatMap(materials, {
    tempContext,
    dpr: viewSizeInfo.devicePixelRatio,
  });
  return updateVirtualItemMapStatus(visibleInfoMap, { viewScaleInfo, viewSizeInfo });
}

function isRangeBoundingBoxCollide(info1: BoundingInfo, info2: BoundingInfo): boolean {
  const centerX = info1.center.x;
  const centerY = info1.center.y;
  const rect1MinX = Math.min(info1.topLeft.x, info1.topRight.x, info1.bottomLeft.x, info1.bottomRight.x);
  const rect1MaxX = Math.max(info1.topLeft.x, info1.topRight.x, info1.bottomLeft.x, info1.bottomRight.x);
  const rect1MinY = Math.min(info1.topLeft.y, info1.topRight.y, info1.bottomLeft.y, info1.bottomRight.y);
  const rect1MaxY = Math.max(info1.topLeft.y, info1.topRight.y, info1.bottomLeft.y, info1.bottomRight.y);

  const w = Math.abs(rect1MaxX - rect1MinX);
  const h = Math.abs(rect1MaxY - rect1MinY);

  const rect2MinX = Math.min(info2.topLeft.x, info2.topRight.x, info2.bottomLeft.x, info2.bottomRight.x) - w;
  const rect2MaxX = Math.max(info2.topLeft.x, info2.topRight.x, info2.bottomLeft.x, info2.bottomRight.x) + w;
  const rect2MinY = Math.min(info2.topLeft.y, info2.topRight.y, info2.bottomLeft.y, info2.bottomRight.y) - h;
  const rect2MaxY = Math.max(info2.topLeft.y, info2.topRight.y, info2.bottomLeft.y, info2.bottomRight.y) + h;

  if (centerX >= rect2MinX && centerX <= rect2MaxX && centerY >= rect2MinY && centerY <= rect2MaxY) {
    return true;
  }

  return false;
}

// function logVirtualItemMapStatus(virtualItemMap: VirtualItemMap) {
//   console.log('------------------------------------------------');
//   Object.keys(virtualItemMap).forEach((id) => {
//     const item = virtualItemMap[id];
//     const info = item.boundingInfo;
//     const rect = {
//       x: info.topLeft.x,
//       y: info.topRight.y,
//       w: info.bottomRight.x - info.topLeft.x,
//       h: info.bottomRight.y - info.topLeft.y,
//     };
//     console.log('view: ', id, item.isVisibleInView, rect);
//   });
// }

export function updateVirtualItemMapStatus(
  virtualItemMap: VirtualItemMap,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): {
  virtualItemMap: VirtualItemMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const canvasBoundingBox = calcVisibleOriginCanvasBoundingBox(opts);
  let visibleCount = 0;
  let invisibleCount = 0;
  Object.keys(virtualItemMap).forEach((id) => {
    const info = virtualItemMap[id];
    info.isVisibleInView = isRangeBoundingBoxCollide(info.rangeBoundingInfo, canvasBoundingBox);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    info.isVisibleInView ? visibleCount++ : invisibleCount++;
  });

  // TODO
  // logVirtualItemMapStatus(virtualItemMap);

  return { virtualItemMap, visibleCount, invisibleCount };
}

export function calcVisibleOriginCanvasBoundingBox(opts: {
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): BoundingInfo {
  const { viewScaleInfo, viewSizeInfo } = opts;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;
  const { width, height } = viewSizeInfo;

  const x = 0 - offsetLeft / scale;
  const y = 0 - offsetTop / scale;
  const w = width / scale;
  const h = height / scale;

  const center = calcMaterialCenter({ x, y, width, height });
  const topLeft = { x, y };
  const topRight = { x: x + w, y };
  const bottomLeft = { x, y: y + h };
  const bottomRight = { x: x + w, y: y + h };
  const left = { x, y: center.y };
  const top = { x: center.x, y };
  const right = { x: x + w, y: center.y };
  const bottom = { x: center.x, y: y + h };
  const boundingBox: BoundingInfo = {
    center,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    left,
    top,
    right,
    bottom,
  };
  return boundingBox;
}

// export function isInVisiableView(rangeBoundingInfo: BoundingInfo) {}
