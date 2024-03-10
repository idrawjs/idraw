import type { Element, ElementSize, ViewRectInfo, ViewScaleInfo } from '@idraw/types';
import { calcElementViewRectInfo } from '@idraw/util';

export function getElementViewRectInfo(
  elem: ElementSize,
  opts: {
    groupQueue: Element<'group'>[];
    viewScaleInfo: ViewScaleInfo;
  }
): ViewRectInfo {
  const { groupQueue, viewScaleInfo } = opts;
  const viewRectInfo = calcElementViewRectInfo(elem, {
    groupQueue,
    viewScaleInfo,
    range: true
  });
  return viewRectInfo;
}
