import type { Data, Element, Elements, ElementType, ElementSize, ViewContextSize, ViewSizeInfo } from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import { isAssetId } from './uuid';

// // TODO need to be deprecated
// function getGroupIndexes(elem: Element<'group'>, uuids: string[], parentIndex: string): string[] {
//   let indexes: string[] = [];
//   if (elem?.type === 'group' && elem?.detail?.children?.length > 0) {
//     for (let i = 0; i < elem.detail.children.length; i++) {
//       const child = elem.detail.children[i];
//       if (uuids.includes(child.uuid)) {
//         indexes.push([parentIndex, i].join('.'));
//       } else if (elem.type === 'group') {
//         indexes = indexes.concat(getGroupIndexes(child as Element<'group'>, uuids, [parentIndex, i].join('.')));
//       }
//     }
//   }
//   return indexes;
// }

// // TODO need to be deprecated
// export function getSelectedElementIndexes(data: Data, uuids: string[]): Array<string | number> {
//   let indexes: Array<string | number> = [];
//   if (Array.isArray(data?.elements) && data?.elements?.length > 0 && Array.isArray(uuids) && uuids.length > 0) {
//     for (let i = 0; i < data.elements.length; i++) {
//       const elem = data.elements[i];
//       if (uuids.includes(elem.uuid)) {
//         indexes.push(i);
//       } else if (elem.type === 'group') {
//         indexes = indexes.concat(getGroupIndexes(elem as Element<'group'>, uuids, `${i}`));
//       }
//     }
//   }
//   return indexes;
// }

function getGroupUUIDs(elements: Array<Element<ElementType>>, index: string): string[] {
  const uuids: string[] = [];
  if (typeof index === 'string' && /^\d+(\.\d+)*$/.test(index)) {
    const nums = index.split('.');
    let target: Array<Element<ElementType>> = elements;
    while (nums.length > 0) {
      const num = nums.shift();
      if (typeof num === 'string') {
        const elem = target[parseInt(num)];
        if (elem && nums.length === 0) {
          uuids.push(elem.uuid);
        } else if (elem.type === 'group' && nums.length > 0) {
          target = (elem as Element<'group'>)?.detail?.children || [];
        }
      }
      break;
    }
  }
  return uuids;
}

export function getSelectedElementUUIDs(data: Data, indexes: Array<number | string>): string[] {
  let uuids: string[] = [];
  if (Array.isArray(data?.elements) && data?.elements?.length > 0 && Array.isArray(indexes) && indexes.length > 0) {
    indexes.forEach((idx: number | string) => {
      if (typeof idx === 'number') {
        if (data?.elements?.[idx]) {
          uuids.push(data.elements[idx].uuid);
        }
      } else if (typeof idx === 'string') {
        uuids = uuids.concat(getGroupUUIDs(data.elements, idx));
      }
    });
  }
  return uuids;
}

// // TODO need to be deprecated
// function getElementInGroup(elem: Element<'group'>, uuids: string[]): Array<Element<ElementType>> {
//   let elements: Array<Element<ElementType>> = [];
//   if (elem?.type === 'group' && elem?.detail?.children?.length > 0) {
//     for (let i = 0; i < elem.detail.children.length; i++) {
//       const child = elem.detail.children[i];
//       if (uuids.includes(child.uuid)) {
//         elements.push(child);
//       } else if (elem.type === 'group' && elem.detail?.children?.length > 0) {
//         elements = elements.concat(getElementInGroup(child as Element<'group'>, uuids));
//       }
//     }
//   }
//   return elements;
// }

// // TODO need to be deprecated
// export function getSelectedElements(data: Data | null | undefined, uuids: string[], groupQueue?: Element<'group'>[]): Array<Element<ElementType>> {
//   let elements: Array<Element<ElementType>> = [];
//   if (Array.isArray(groupQueue) && groupQueue.length > 0) {
//     elements = getElementInGroup(groupQueue[groupQueue.length - 1], uuids);
//   } else if (data && Array.isArray(data?.elements) && data?.elements?.length > 0 && Array.isArray(uuids) && uuids.length > 0) {
//     for (let i = 0; i < data.elements.length; i++) {
//       const elem = data.elements[i];
//       if (uuids.includes(elem.uuid)) {
//         elements.push(elem);
//       }
//     }
//   }
//   return elements;
// }

export function validateElements(elements: Array<Element<ElementType>>): boolean {
  let isValid = true;
  if (Array.isArray(elements)) {
    const uuids: string[] = [];
    elements.forEach((elem) => {
      if (typeof elem.uuid === 'string' && elem.uuid) {
        if (uuids.includes(elem.uuid)) {
          isValid = false;
          // eslint-disable-next-line no-console
          console.warn(`Duplicate uuids: ${elem.uuid}`);
        } else {
          uuids.push(elem.uuid);
        }
      } else {
        isValid = false;
        // eslint-disable-next-line no-console
        console.warn('Element missing uuid', elem);
      }
      if (elem.type === 'group') {
        isValid = validateElements((elem as Element<'group'>)?.detail?.children);
      }
    });
  }
  return isValid;
}

type AreaSize = ElementSize;

export function calcElementsContextSize(
  elements: Array<Element<ElementType>>,
  opts?: { viewWidth: number; viewHeight: number; extend?: boolean }
): ViewContextSize {
  const area: AreaSize = { x: 0, y: 0, w: 0, h: 0 };
  elements.forEach((elem: Element<ElementType>) => {
    const elemSize: ElementSize = {
      x: elem.x,
      y: elem.y,
      w: elem.w,
      h: elem.h,
      angle: elem.angle
    };
    if (elemSize.angle && (elemSize.angle > 0 || elemSize.angle < 0)) {
      const ves = rotateElementVertexes(elemSize);
      if (ves.length === 4) {
        const xList = [ves[0].x, ves[1].x, ves[2].x, ves[3].x];
        const yList = [ves[0].y, ves[1].y, ves[2].y, ves[3].y];
        elemSize.x = Math.min(...xList);
        elemSize.y = Math.min(...yList);
        elemSize.w = Math.abs(Math.max(...xList) - Math.min(...xList));
        elemSize.h = Math.abs(Math.max(...yList) - Math.min(...yList));
      }
    }
    const areaStartX = Math.min(elemSize.x, area.x);
    const areaStartY = Math.min(elemSize.y, area.y);

    const areaEndX = Math.max(elemSize.x + elemSize.w, area.x + area.w);
    const areaEndY = Math.max(elemSize.y + elemSize.h, area.y + area.h);

    area.x = areaStartX;
    area.y = areaStartY;
    area.w = Math.abs(areaEndX - areaStartX);
    area.h = Math.abs(areaEndY - areaStartY);
  });

  if (opts?.extend) {
    area.x = Math.min(area.x, 0);
    area.y = Math.min(area.y, 0);
  }

  const ctxSize: ViewContextSize = {
    contextX: area.x,
    contextY: area.y,
    contextWidth: area.w,
    contextHeight: area.h
  };

  if (opts?.viewWidth && opts?.viewHeight && opts?.viewWidth > 0 && opts?.viewHeight > 0) {
    if (opts.viewWidth > area.x + area.w) {
      ctxSize.contextWidth = opts.viewWidth - area.x;
    }
    if (opts.viewHeight > area.y + area.h) {
      ctxSize.contextHeight = opts.viewHeight - area.y;
    }
  }
  return ctxSize;
}

export function calcElementsViewInfo(
  elements: Array<Element<ElementType>>,
  prevViewSize: ViewSizeInfo,
  options?: {
    extend: boolean;
  }
): {
  contextSize: ViewContextSize;
  changeContextLeft: number;
  changeContextRight: number;
  changeContextTop: number;
  changeContextBottom: number;
} {
  const contextSize = calcElementsContextSize(elements, { viewWidth: prevViewSize.width, viewHeight: prevViewSize.height, extend: options?.extend });

  if (options?.extend === true) {
    contextSize.contextX = Math.min(0, contextSize.contextX, prevViewSize.contextX);
    contextSize.contextY = Math.min(0, contextSize.contextY, prevViewSize.contextY);
    contextSize.contextWidth = Math.max(contextSize.contextWidth, prevViewSize.contextWidth);
    contextSize.contextHeight = Math.max(contextSize.contextHeight, prevViewSize.contextHeight);
  }

  let changeContextLeft = 0;
  let changeContextRight = 0;
  let changeContextTop = 0;
  let changeContextBottom = 0;

  if (contextSize.contextX !== prevViewSize.contextX) {
    changeContextLeft = contextSize.contextX - prevViewSize.contextX;
  } else if (contextSize.contextWidth !== prevViewSize.contextWidth) {
    changeContextRight = contextSize.contextWidth - prevViewSize.contextWidth;
  }
  if (contextSize.contextY !== prevViewSize.contextY) {
    changeContextTop = contextSize.contextY - prevViewSize.contextY;
  } else if (contextSize.contextHeight !== prevViewSize.contextHeight) {
    changeContextBottom = contextSize.contextHeight - prevViewSize.contextHeight;
  }

  return {
    contextSize,
    changeContextLeft,
    changeContextRight,
    changeContextTop,
    changeContextBottom
  };
}

export function getElemenetsAssetIds(elements: Elements): string[] {
  const assetIds: string[] = [];
  const _scanElements = (elems: Elements) => {
    elems.forEach((elem: Element<ElementType>) => {
      if (elem.type === 'image' && isAssetId((elem as Element<'image'>).detail.src)) {
        assetIds.push((elem as Element<'image'>).detail.src);
      } else if (elem.type === 'svg' && isAssetId((elem as Element<'svg'>).detail.svg)) {
        assetIds.push((elem as Element<'svg'>).detail.svg);
      } else if (elem.type === 'html' && (elem as Element<'html'>).detail.html) {
        assetIds.push((elem as Element<'html'>).detail.html);
      } else if (elem.type === 'group' && Array.isArray((elem as Element<'group'>).detail.children)) {
        _scanElements((elem as Element<'group'>).detail.children);
      }
    });
  };
  _scanElements(elements);
  return assetIds;
}
