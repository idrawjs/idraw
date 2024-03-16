import { Element, ElementPosition, Elements, ViewScaleInfo, ViewSizeInfo, ViewRectInfo, ViewVisibleInfoMap, ViewVisibleInfo } from '@idraw/types';
import { calcElementOriginRectInfo, originRectInfoToRangeRectInfo } from './view-calc';
import { getGroupQueueByElementPosition } from './element';
import { calcElementCenter } from './rotate';
import { is } from './is';

export function sortElementsViewVisiableInfoMap(
  elements: Elements,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
): {
  viewVisibleInfoMap: ViewVisibleInfoMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const visibleInfoMap: ViewVisibleInfoMap = {};
  const currentPosition: ElementPosition = [];

  const _walk = (elem: Element) => {
    const baseInfo: Omit<ViewVisibleInfo, 'originRectInfo' | 'rangeRectInfo'> = {
      isVisibleInView: true,
      isGroup: elem.type === 'group',
      position: [...currentPosition]
    };
    let originRectInfo: ViewRectInfo | null = null;

    const groupQueue = getGroupQueueByElementPosition(elements, currentPosition);

    originRectInfo = calcElementOriginRectInfo(elem, {
      groupQueue: groupQueue || []
    });

    visibleInfoMap[elem.uuid] = {
      ...baseInfo,
      ...{
        originRectInfo: originRectInfo as ViewRectInfo,
        rangeRectInfo: is.angle(elem.angle) ? originRectInfoToRangeRectInfo(originRectInfo as ViewRectInfo) : originRectInfo
      }
    };

    if (elem.type === 'group') {
      (elem as Element<'group'>).detail.children.forEach((ele, i) => {
        currentPosition.push(i);
        _walk(ele);
        currentPosition.pop();
      });
    }
  };

  elements.forEach((elem, index) => {
    currentPosition.push(index);
    _walk(elem);
    currentPosition.pop();
  });

  return updateViewVisibleInfoMapStatus(visibleInfoMap, opts);
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

// function logViewVisibleInfoMapStatus(viewVisibleInfoMap: ViewVisibleInfoMap) {
//   console.log('------------------------------------------------');
//   Object.keys(viewVisibleInfoMap).forEach((uuid) => {
//     const item = viewVisibleInfoMap[uuid];
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

export function updateViewVisibleInfoMapStatus(
  viewVisibleInfoMap: ViewVisibleInfoMap,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
): {
  viewVisibleInfoMap: ViewVisibleInfoMap;
  visibleCount: number;
  invisibleCount: number;
} {
  const canvasRectInfo = calcVisibleOriginCanvasRectInfo(opts);
  let visibleCount = 0;
  let invisibleCount = 0;
  Object.keys(viewVisibleInfoMap).forEach((uuid) => {
    const info = viewVisibleInfoMap[uuid];
    info.isVisibleInView = isRangeRectInfoCollide(info.rangeRectInfo, canvasRectInfo);
    info.isVisibleInView ? visibleCount++ : invisibleCount++;
  });

  // logViewVisibleInfoMapStatus(viewVisibleInfoMap);

  return { viewVisibleInfoMap, visibleCount, invisibleCount };
}

export function calcVisibleOriginCanvasRectInfo(opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewRectInfo {
  const { viewScaleInfo, viewSizeInfo } = opts;
  // console.log('xxx ===== ', viewScaleInfo, viewSizeInfo);
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
