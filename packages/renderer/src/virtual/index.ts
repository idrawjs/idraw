import {
  StrictMaterial,
  MaterialPosition,
  BoundingInfo,
  VirtualItemMap,
  VirtualItem,
  VirtualAttributes,
  ViewContext2D,
  CalcVirtualAttributesOptions,
} from '@idraw/types';
import {
  is,
  getGroupQueueByMaterialPosition,
  calcMaterialBoundingInfo,
  boundingInfoToRangeBoundingInfo,
} from '@idraw/util';

import { calcVirtualBaseAttributes } from './base';
import { calcVirtualRectAttributes } from './rect';
import { calcVirtualCircleAttributes } from './circle';
import { calcVirtualEllipseAttributes } from './ellipse';
import { calcVirtualTextAttributes } from './text';
import { calcVirtualPathAttributes } from './path';

export function calcVirtualAttributes(
  mtrl: StrictMaterial,
  opts: CalcVirtualAttributesOptions
): VirtualAttributes | null {
  let attributes: VirtualAttributes | null = null;

  switch (mtrl.type) {
    case 'rect': {
      attributes = calcVirtualRectAttributes(mtrl as StrictMaterial<'rect'>, opts);
      break;
    }
    case 'circle': {
      attributes = calcVirtualCircleAttributes(mtrl as StrictMaterial<'circle'>, opts);
      break;
    }
    case 'ellipse': {
      attributes = calcVirtualEllipseAttributes(mtrl as StrictMaterial<'ellipse'>, opts);
      break;
    }
    case 'text': {
      attributes = calcVirtualTextAttributes(mtrl as StrictMaterial<'text'>, opts);
      break;
    }
    case 'group': {
      attributes = calcVirtualRectAttributes(mtrl as StrictMaterial<'rect'>, opts);
      break;
    }
    case 'path': {
      attributes = calcVirtualPathAttributes(mtrl as StrictMaterial<'path'>, opts);
      break;
    }
    default: {
      attributes = calcVirtualBaseAttributes(mtrl, opts);
      break;
    }
  }

  return attributes;
}

export function materialsToVirtualFlatMap(
  materials: StrictMaterial[],
  opts: { tempContext: ViewContext2D; dpr: number }
): VirtualItemMap {
  const virtualFlatMap: VirtualItemMap = {};
  const currentPosition: MaterialPosition = [];

  const _walk = (mtrl: StrictMaterial) => {
    const baseInfo: Omit<VirtualItem, 'boundingInfo' | 'rangeBoundingInfo'> = {
      type: mtrl.type,
      isVisibleInView: true,
      position: [...currentPosition],
    };
    let boundingInfo: BoundingInfo | null = null;

    const groupQueue = getGroupQueueByMaterialPosition(materials, currentPosition);

    boundingInfo = calcMaterialBoundingInfo(mtrl, {
      groupQueue: groupQueue || [],
    });

    const virtualItem: VirtualItem = {
      ...baseInfo,
      ...{
        boundingInfo: boundingInfo as BoundingInfo,
        rangeBoundingInfo: is.angle(mtrl.angle)
          ? boundingInfoToRangeBoundingInfo(boundingInfo as BoundingInfo)
          : boundingInfo,
      },
      ...calcVirtualAttributes(mtrl, {
        ...opts,
        groupQueue: groupQueue || [],
      }),
    };

    virtualFlatMap[mtrl.id] = virtualItem;

    if (mtrl.type === 'group') {
      (mtrl as StrictMaterial<'group'>).children.forEach((ele, i) => {
        currentPosition.push(i);
        _walk(ele);
        currentPosition.pop();
      });
    }
  };

  materials.forEach((mtrl, index) => {
    currentPosition.push(index);
    _walk(mtrl);
    currentPosition.pop();
  });

  return virtualFlatMap;
}
