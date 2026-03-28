import type { StrictMaterial, MaterialPosition } from '@idraw/types';
import { findMaterialFromListByPosition, calcMaterialListSize } from './material';
import { deleteMaterialInListByPosition, insertMaterialToListByPosition } from './handle-material';
import { createUUID } from '../tool/uuid';

export function groupMaterialsByPosition(list: StrictMaterial[], positions: MaterialPosition[]): StrictMaterial[] {
  if (positions.length > 1) {
    let isValidPositions: boolean = true;
    const lastIndexs: number[] = [];
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
      // eslint-disable-next-line no-console
      console.error('[idraw]: The grouped materials are not siblings!');
      return list;
    }
    lastIndexs.sort((a, b) => a - b);
    const groupParentPosition = [...positions[0]].splice(0, positions[0].length - 1);
    const groupChildren: StrictMaterial[] = [];

    const groupPosition = [...groupParentPosition, lastIndexs[0]];
    for (let i = 0; i < lastIndexs.length; i++) {
      const position = [...groupParentPosition, lastIndexs[i]];
      const mtrl = findMaterialFromListByPosition(position, list);
      if (mtrl) {
        groupChildren.push(mtrl);
      }
    }

    const groupSize = calcMaterialListSize(groupChildren);
    for (let i = 0; i < groupChildren.length; i++) {
      const mtrl = groupChildren[i];
      if (mtrl) {
        mtrl.x -= groupSize.x;
        mtrl.y -= groupSize.y;
      }
    }

    for (let i = lastIndexs.length - 1; i >= 0; i--) {
      const position = [...groupParentPosition, lastIndexs[i]];
      deleteMaterialInListByPosition(position, list);
    }

    const group: StrictMaterial<'group'> = {
      name: 'Group',
      id: createUUID(),
      type: 'group',
      ...groupSize,
      children: groupChildren,
    };
    insertMaterialToListByPosition(group, groupPosition, list);
  }
  return list;
}

export function ungroupMaterialsByPosition(list: StrictMaterial[], position: MaterialPosition): StrictMaterial[] {
  const mtrl = findMaterialFromListByPosition(position, list) as StrictMaterial<'group'>;
  if (!(mtrl && mtrl?.type === 'group' && Array.isArray(mtrl?.children))) {
    // eslint-disable-next-line no-console
    console.error('[idraw]: The ungrouped material is not a group material!');
  }
  const groupParentPosition = [...position].splice(0, position.length - 1);
  const groupLastIndex = position[position.length - 1];

  const { x, y } = mtrl;
  deleteMaterialInListByPosition(position, list);
  mtrl.children.forEach((child, i) => {
    child.x += x;
    child.y += y;
    const mtrlPosition = [...groupParentPosition, groupLastIndex + i];
    insertMaterialToListByPosition(child, mtrlPosition, list);
  });

  return list;
}
