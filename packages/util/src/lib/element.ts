import type {
  Data,
  Element,
  Elements,
  ElementType,
  ElementSize,
  ViewContextSize,
  ViewSizeInfo,
  RecursivePartial,
  ElementAssets,
  ElementAssetsItem,
  LoadElementType,
  ElementPosition
} from '@idraw/types';
import { rotateElementVertexes } from './rotate';
import { isAssetId, createAssetId } from './uuid';
import { istype } from './istype';

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
      if (istype.json(updateContent[commonKey] as any)) {
        if (!(originElem as Object)?.hasOwnProperty(commonKey)) {
          // @ts-ignore
          originElem[commonKey] = {};
        }
        // @ts-ignore
        if (istype.json(originElem[commonKey])) {
          // @ts-ignore
          originElem[commonKey] = { ...originElem[commonKey], ...updateContent[commonKey] };
        }
        // @ts-ignore
      } else if (istype.array(updateContent[commonKey] as any)) {
        if (!(originElem as Object)?.hasOwnProperty(commonKey)) {
          // @ts-ignore
          originElem[commonKey] = [];
        }
        // @ts-ignore
        if (istype.array(originElem[commonKey])) {
          ((updateContent as any)?.[commonKey] as Array<any>)?.forEach((item, i) => {
            // @ts-ignore
            originElem[commonKey][i] = item;
          });
          // @ts-ignore
          originElem[commonKey] = [...originElem[commonKey], ...updateContent[commonKey]];
        }
      }
    }
  }
  return originElem;
}

export function updateElementInList(uuid: string, updateContent: RecursivePartial<Element<ElementType>>, elements: Element[]): Element | null {
  let targetElement: Element | null = null;
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    if (elem.uuid === uuid) {
      mergeElement(elem, updateContent);
      targetElement = elem;
      break;
    } else if (elem.type === 'group') {
      targetElement = updateElementInList(uuid, updateContent, (elem as Element<'group'>)?.detail?.children || []);
    }
  }
  return targetElement;
}

export function getElementSize(elem: Element): ElementSize {
  const { x, y, w, h, angle } = elem;
  const size: ElementSize = { x, y, w, h, angle };
  return size;
}

export function mergeElementAsset<T extends Element<LoadElementType>>(element: T, assets: ElementAssets): T {
  // const elem: T = { ...element, ...{ detail: { ...element.detail } } };
  const elem = element;
  let assetId: string | null = null;
  let assetItem: ElementAssetsItem | null = null;
  if (elem.type === 'image') {
    assetId = (elem as Element<'image'>).detail.src;
  } else if (elem.type === 'svg') {
    assetId = (elem as Element<'svg'>).detail.svg;
  } else if (elem.type === 'html') {
    assetId = (elem as Element<'html'>).detail.html;
  }

  if (assetId && assetId?.startsWith('@assets/')) {
    assetItem = assets[assetId];
  }

  if (assetItem?.type === elem.type && typeof assetItem?.value === 'string' && assetItem?.value) {
    if (elem.type === 'image') {
      (elem as Element<'image'>).detail.src = assetItem.value;
    } else if (elem.type === 'svg') {
      (elem as Element<'svg'>).detail.svg = assetItem.value;
    } else if (elem.type === 'html') {
      (elem as Element<'html'>).detail.html = assetItem.value;
    }
  }
  return elem;
}

export function filterElementAsset<T extends Element<LoadElementType>>(
  element: T
): {
  element: T;
  assetId: string | null;
  assetItem: ElementAssetsItem | null;
} {
  let assetId: string | null = null;
  let assetItem: ElementAssetsItem | null = null;
  let resource: string | null = null;

  if (element.type === 'image') {
    resource = (element as Element<'image'>).detail.src;
  } else if (element.type === 'svg') {
    resource = (element as Element<'svg'>).detail.svg;
  } else if (element.type === 'html') {
    resource = (element as Element<'html'>).detail.html;
  }

  if (typeof resource === 'string' && !isAssetId(resource)) {
    assetId = createAssetId(resource);
    assetItem = {
      type: element.type as LoadElementType,
      value: resource
    };
    if (element.type === 'image') {
      (element as Element<'image'>).detail.src = assetId;
    } else if (element.type === 'svg') {
      (element as Element<'svg'>).detail.svg = assetId;
    } else if (element.type === 'html') {
      (element as Element<'html'>).detail.html = assetId;
    }
  }

  return {
    element,
    assetId,
    assetItem
  };
}

export function isResourceElement(elem: Element): boolean {
  return ['image', 'svg', 'html'].includes(elem?.type);
}

export function findElementsFromListByPositions(positions: ElementPosition[], list: Element[]): Element[] {
  const elements: Element[] = [];
  positions.forEach((pos: ElementPosition) => {
    const elem = findElementFromListByPosition(pos, list);
    if (elem) {
      elements.push(elem);
    }
  });
  return elements;
}

export function findElementFromListByPosition(position: ElementPosition, list: Element[]): Element | null {
  let result: Element | null = null;
  let tempList: Element[] = list;
  for (let i = 0; i < position.length; i++) {
    const pos = position[i];
    const item = tempList[pos];
    if (i < position.length - 1 && item.type === 'group') {
      tempList = (item as Element<'group'>).detail.children;
    } else if (i === position.length - 1) {
      result = item;
    } else {
      break;
    }
  }
  return result;
}

export function insertElementToListByPosition(element: Element, position: ElementPosition, list: Element[]): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 0, element);
    result = true;
  } else if (position.length > 1) {
    let tempList: Element[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 0, element);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as Element<'group'>).detail.children;
      } else {
        break;
      }
    }
  }
  return result;
}

export function deleteElementInListByPosition(position: ElementPosition, list: Element[]): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 1);
    result = true;
  } else if (position.length > 1) {
    let tempList: Element[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 1);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as Element<'group'>).detail.children;
      } else {
        break;
      }
    }
  }
  return result;
}
