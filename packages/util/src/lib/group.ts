import type { Elements, Element, ElementPosition } from '@idraw/types';
import { findElementFromListByPosition, calcElementListSize } from './element';
import { deleteElementInListByPosition, insertElementToListByPosition } from './handle-element';
import { createUUID } from './uuid';

export function groupElementsByPosition(list: Elements, positions: ElementPosition[]): Elements {
  if (positions.length > 1) {
    let isValidPositions: boolean = true;
    let lastIndexs: number[] = [];
    for (let i = 1; i < positions.length; i++) {
      const prevPosition = positions[i - 1];
      const position = positions[i];
      if (!(prevPosition.length > 0 && position.length > 0)) {
        isValidPositions = false;
        break;
      }

      if (prevPosition.length !== position.length) {
        isValidPositions = false;
        break;
      }

      const temp1 = [...prevPosition];
      const temp2 = [...position];
      const lastIndex1 = temp1.pop();
      const lastIndex2 = temp2.pop();
      if (i === 1 && typeof lastIndex1 === 'number' && lastIndex1 >= 0) {
        lastIndexs.push(lastIndex1 as number);
      }
      if (typeof lastIndex2 === 'number' && lastIndex2 >= 0) {
        lastIndexs.push(lastIndex2 as number);
      }
    }
    if (isValidPositions !== true) {
      console.error('[idraw]: The grouped elements are not siblings!');
      return list;
    }
    lastIndexs.sort((a, b) => a - b);
    const groupParentPosition = [...positions[0]].splice(0, positions[0].length - 1);
    const groupChildren: Elements = [];

    const groupPosition = [...groupParentPosition, lastIndexs[0]];
    for (let i = 0; i < lastIndexs.length; i++) {
      const position = [...groupParentPosition, lastIndexs[i]];
      const elem = findElementFromListByPosition(position, list);
      if (elem) {
        groupChildren.push(elem);
      }
    }

    const groupSize = calcElementListSize(groupChildren);
    for (let i = 0; i < groupChildren.length; i++) {
      const elem = groupChildren[i];
      if (elem) {
        elem.x -= groupSize.x;
        elem.y -= groupSize.y;
      }
    }

    for (let i = lastIndexs.length - 1; i >= 0; i--) {
      const position = [...groupParentPosition, lastIndexs[i]];
      deleteElementInListByPosition(position, list);
    }

    const group: Element<'group'> = {
      name: 'Group',
      uuid: createUUID(),
      type: 'group',
      ...groupSize,
      detail: {
        children: groupChildren
      }
    };
    insertElementToListByPosition(group, groupPosition, list);
  }
  return list;
}

export function ungroupElementsByPosition(list: Elements, position: ElementPosition): Elements {
  const elem = findElementFromListByPosition(position, list) as Element<'group'>;
  if (!(elem && elem?.type === 'group' && Array.isArray(elem?.detail?.children))) {
    console.error('[idraw]: The ungrouped element is not a group element!');
  }
  const groupParentPosition = [...position].splice(0, position.length - 1);
  const groupLastIndex = position[position.length - 1];

  const { x, y } = elem;
  deleteElementInListByPosition(position, list);
  elem.detail.children.forEach((child, i) => {
    child.x += x;
    child.y += y;
    const elemPosition = [...groupParentPosition, groupLastIndex + i];
    insertElementToListByPosition(child, elemPosition, list);
  });

  return list;
}
