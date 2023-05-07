import type { Data, Element, ElementType } from '@idraw/types';

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
