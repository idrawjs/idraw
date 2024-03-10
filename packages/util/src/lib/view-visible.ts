import { Element, ElementPosition, Elements, ViewRectInfo, ViewVisibleInfoMap, ViewVisibleInfo } from '@idraw/types';
import { calcElementOriginRectInfo } from './view-calc';
import { getGroupQueueByElementPosition } from './element';

export function sortElementsViewVisiableInfoMap(elements: Elements): ViewVisibleInfoMap {
  const visibleInfoMap: ViewVisibleInfoMap = {};
  const currentPosition: ElementPosition = [];

  const _walk = (elem: Element) => {
    const baseInfo: Omit<ViewVisibleInfo, 'originRectInfo'> = {
      viewRectInfo: null,
      rangeRectInfo: null,
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
        originRectInfo: originRectInfo as ViewRectInfo
      }
    };

    if (elem.type === 'group') {
      (elem as Element<'group'>).detail.children.forEach((ele, i) => {
        if (ele.type === 'group') {
          currentPosition.push(i);
        }
        _walk(ele);
        if (ele.type === 'group') {
          currentPosition.pop();
        }
      });
    }
  };

  elements.forEach((elem, index) => {
    currentPosition.push(index);
    _walk(elem);
    currentPosition.pop();
  });

  return visibleInfoMap;
}
