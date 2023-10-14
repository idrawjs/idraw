import type { Data, Element, Elements, ElementType, ElementSize, ViewContextSize, ViewSizeInfo, RecursivePartial } from '@idraw/types';
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
} {
  const contextSize = calcElementsContextSize(elements, { viewWidth: prevViewSize.width, viewHeight: prevViewSize.height, extend: options?.extend });
  if (options?.extend === true) {
    contextSize.contextWidth = Math.max(contextSize.contextWidth, prevViewSize.contextWidth);
    contextSize.contextHeight = Math.max(contextSize.contextHeight, prevViewSize.contextHeight);
  }
  return {
    contextSize
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

export function findElementFromList(uuid: string, list: Element<ElementType>[]): Element<ElementType> | null {
  let result: Element<ElementType> | null = null;
  for (let i = 0; i < list.length; i++) {
    const elem = list[i];
    if (elem.uuid === uuid) {
      result = elem;
      break;
    } else if (!result && elem.type === 'group') {
      const resultInGroup = findElementFromList(uuid, (elem as Element<'group'>)?.detail?.children || []);
      if (resultInGroup?.uuid === uuid) {
        result = resultInGroup;
        break;
      }
    }
  }
  return result;
}

export function findElementsFromList(uuids: string[], list: Element<ElementType>[]): Element<ElementType>[] {
  const result: Element<ElementType>[] = [];

  function _find(elements: Element<ElementType>[]) {
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      if (uuids.includes(elem.uuid)) {
        result.push(elem);
      } else if (elem.type === 'group') {
        _find((elem as Element<'group'>)?.detail?.children || []);
      }
    }
  }
  _find(list);
  return result;
}

export function getGroupQueueFromList(uuid: string, elements: Element<ElementType>[]): Element<'group'>[] {
  const groupQueue: Element<'group'>[] = [];

  function _scan(uuid: string, elements: Element<ElementType>[]): Element<ElementType> | null {
    let result: Element<ElementType> | null = null;
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      if (elem.uuid === uuid) {
        result = elem;
        break;
      } else if (!result && elem.type === 'group') {
        groupQueue.push(elem as Element<'group'>);
        const resultInGroup = _scan(uuid, (elem as Element<'group'>)?.detail?.children || []);
        if (resultInGroup?.uuid === uuid) {
          result = resultInGroup;
          break;
        }
        groupQueue.pop();
      }
    }
    return result;
  }
  _scan(uuid, elements);
  return groupQueue;
}

function mergeElement<T extends Element<ElementType> = Element<ElementType>>(originElem: T, updateContent: RecursivePartial<T>): T {
  const commonKeys = Object.keys(updateContent);
  for (let i = 0; i < commonKeys.length; i++) {
    const commonKey = commonKeys[i];
    if (['x', 'y', 'w', 'h', 'angle', 'name'].includes(commonKey)) {
      // @ts-ignore
      originElem[commonKey] = updateContent[commonKey];
    } else if (['detail', 'operations'].includes(commonKey)) {
      // @ts-ignore
      if (istype.json(updateContent[commonKey] as any) && istype.json(originElem[commonKey])) {
        // @ts-ignore
        originElem[commonKey] = { ...originElem[commonKey], ...updateContent[commonKey] };
        // @ts-ignore
      } else if (istype.array(updateContent[commonKey] as any) && istype.array(originElem[commonKey])) {
        // @ts-ignore
        originElem[commonKey] = { ...originElem[commonKey], ...updateContent[commonKey] };
      }
    }
  }
  return originElem;
}

export function updateElementInList(
  uuid: string,
  updateContent: RecursivePartial<Element<ElementType>>,
  elements: Element<ElementType>[]
): Element<ElementType>[] {
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    if (elem.uuid === uuid) {
      mergeElement(elem, updateContent);
      break;
    } else if (elem.type === 'group') {
      updateElementInList(uuid, updateContent, (elem as Element<'group'>)?.detail?.children || []);
    }
  }
  return elements;
}
