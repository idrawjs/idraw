import type { Data, Element, ElementType, ElementSize, ViewContextSize, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { rotateElementVertexes } from './rotate';

function getGroupIndexes(elem: Element<'group'>, uuids: string[], parentIndex: string): string[] {
  let indexes: string[] = [];
  if (elem?.type === 'group' && elem?.desc?.children?.length > 0) {
    for (let i = 0; i < elem.desc.children.length; i++) {
      const child = elem.desc.children[i];
      if (uuids.includes(child.uuid)) {
        indexes.push([parentIndex, i].join('.'));
      } else if (elem.type === 'group') {
        indexes = indexes.concat(getGroupIndexes(child as Element<'group'>, uuids, [parentIndex, i].join('.')));
      }
    }
  }
  return indexes;
}

export function getSelectedElementIndexes(data: Data, uuids: string[]): Array<string | number> {
  let indexes: Array<string | number> = [];
  if (Array.isArray(data?.elements) && data?.elements?.length > 0 && Array.isArray(uuids) && uuids.length > 0) {
    for (let i = 0; i < data.elements.length; i++) {
      const elem = data.elements[i];
      if (uuids.includes(elem.uuid)) {
        indexes.push(i);
      } else if (elem.type === 'group') {
        indexes = indexes.concat(getGroupIndexes(elem as Element<'group'>, uuids, `${i}`));
      }
    }
  }
  return indexes;
}

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
          target = (elem as Element<'group'>)?.desc?.children || [];
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

function getElementInGroup(elem: Element<'group'>, uuids: string[]): Array<Element<ElementType>> {
  let elements: Array<Element<ElementType>> = [];
  if (elem?.type === 'group' && elem?.desc?.children?.length > 0) {
    for (let i = 0; i < elem.desc.children.length; i++) {
      const child = elem.desc.children[i];
      if (uuids.includes(child.uuid)) {
        elements.push(child);
      } else if (elem.type === 'group' && elem.desc?.children?.length > 0) {
        elements = elements.concat(getElementInGroup(child as Element<'group'>, uuids));
      }
    }
  }
  return elements;
}

export function getSelectedElements(data: Data | null | undefined, uuids: string[]): Array<Element<ElementType>> {
  let elements: Array<Element<ElementType>> = [];
  if (data && Array.isArray(data?.elements) && data?.elements?.length > 0 && Array.isArray(uuids) && uuids.length > 0) {
    for (let i = 0; i < data.elements.length; i++) {
      const elem = data.elements[i];
      if (uuids.includes(elem.uuid)) {
        elements.push(elem);
      } else if (elem.type === 'group') {
        elements = elements.concat(getElementInGroup(elem as Element<'group'>, uuids));
      }
    }
  }
  return elements;
}

export function validateElements(elements: Array<Element<ElementType>>): boolean {
  let isValid = true;
  if (Array.isArray(elements)) {
    const uuids: string[] = [];
    elements.forEach((elem) => {
      if (typeof elem.uuid === 'string' && elem.uuid) {
        if (uuids.includes(elem.uuid)) {
          isValid = false;
          console.warn(`Duplicate uuids: ${elem.uuid}`);
        } else {
          uuids.push(elem.uuid);
        }
      } else {
        isValid = false;
        console.warn('Element missing uuid', elem);
      }
      if (elem.type === 'group') {
        isValid = validateElements((elem as Element<'group'>)?.desc?.children);
      }
    });
  }
  return isValid;
}

type AreaSize = ElementSize;

export function calcElementsContextSize(elements: Array<Element<ElementType>>): ViewContextSize {
  const area: AreaSize = { x: 0, y: 0, w: 0, h: 0 };
  let prevElemSize: ElementSize | null = null;
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
    if (prevElemSize) {
      const areaStartX = Math.min(elemSize.x, area.x);
      const areaStartY = Math.min(elemSize.y, area.y);

      const areaEndX = Math.max(elemSize.x + elemSize.w, area.x + area.w);
      const areaEndY = Math.max(elemSize.y + elemSize.h, area.y + area.h);

      area.x = areaStartX;
      area.y = areaStartY;
      area.w = Math.abs(areaEndX - areaStartX);
      area.h = Math.abs(areaEndY - areaStartY);
    } else {
      area.x = elemSize.x;
      area.y = elemSize.y;
      area.w = elemSize.w;
      area.h = elemSize.h;
    }
    prevElemSize = elemSize;
  });

  const ctxSize: ViewContextSize = {
    contextX: area.x,
    contextY: area.y,
    contextWidth: area.w,
    contextHeight: area.h
  };
  return ctxSize;
}

export function calcElementsViewInfo(
  elements: Array<Element<ElementType>>,
  prevContextSize: ViewContextSize,
  scaleInfo: ViewScaleInfo
): {
  contextSize: ViewContextSize;
  scaleInfo: ViewScaleInfo;
} {
  const contextSize = calcElementsContextSize(elements);
  let { scale, offsetLeft, offsetRight, offsetBottom, offsetTop } = scaleInfo;
  // TODO
  return {
    contextSize,
    scaleInfo: {
      scale,
      offsetLeft,
      offsetRight,
      offsetBottom,
      offsetTop
    }
  };
}
