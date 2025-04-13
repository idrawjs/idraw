import {
  Element,
  ElementPosition,
  Elements,
  ViewRectInfo,
  VirtualFlatItemMap,
  VirtualFlatItem,
  VirtualFlatDetail,
  ViewContext2D
} from '@idraw/types';
import {
  is,
  getGroupQueueByElementPosition,
  calcElementOriginRectInfo,
  originRectInfoToRangeRectInfo
} from '@idraw/util';

import { calcVirtualTextDetail } from './text';

export function calcVirtualFlatDetail(elem: Element, opts: { tempContext: ViewContext2D }): VirtualFlatDetail {
  let virtualDetail: VirtualFlatDetail = {};
  if (elem.type === 'text') {
    virtualDetail = calcVirtualTextDetail(elem as Element<'text'>, opts);
  }
  return virtualDetail;
}

export function elementsToVirtualFlatMap(elements: Elements, opts: { tempContext: ViewContext2D }): VirtualFlatItemMap {
  const virtualFlatMap: VirtualFlatItemMap = {};
  const currentPosition: ElementPosition = [];

  const _walk = (elem: Element) => {
    const baseInfo: Omit<VirtualFlatItem, 'originRectInfo' | 'rangeRectInfo'> = {
      type: elem.type,
      isVisibleInView: true,
      position: [...currentPosition]
    };
    let originRectInfo: ViewRectInfo | null = null;

    const groupQueue = getGroupQueueByElementPosition(elements, currentPosition);

    originRectInfo = calcElementOriginRectInfo(elem, {
      groupQueue: groupQueue || []
    });

    const virtualItem: VirtualFlatItem = {
      ...baseInfo,
      ...{
        originRectInfo: originRectInfo as ViewRectInfo,
        rangeRectInfo: is.angle(elem.angle)
          ? originRectInfoToRangeRectInfo(originRectInfo as ViewRectInfo)
          : originRectInfo
      },
      ...calcVirtualFlatDetail(elem, opts)
    };

    virtualFlatMap[elem.uuid] = virtualItem;

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

  return virtualFlatMap;
}
