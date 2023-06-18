import { PointSize, Element, ElementSize, ViewRectVertexes } from '@idraw/types';
import { getElementRotateVertexes, calcElementCenter, parseAngleToRadian, rotateVertexes, calcElementCenterFromVertexes } from './rotate';

export function getElementVertexes(elemSize: ElementSize): ViewRectVertexes {
  const { x, y, h, w } = elemSize;
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h }
  ];
}

export function calcElementQueueVertexesQueueInGroup(groupQueue: ElementSize[]): ViewRectVertexes[] {
  const vesList: ViewRectVertexes[] = [];
  let totalX = 0;
  let totalY = 0;

  const rotateActionList: Array<{
    center: PointSize;
    angle: number;
    radian: number;
  }> = [];

  const elemQueue = [...groupQueue];
  for (let i = 0; i < elemQueue.length; i++) {
    const { x, y, w, h, angle = 0 } = elemQueue[i];
    totalX += x;
    totalY += y;
    let ves: [PointSize, PointSize, PointSize, PointSize];
    if (i === 0) {
      const elemSize: ElementSize = { x: totalX, y: totalY, w, h, angle };
      ves = getElementRotateVertexes(elemSize, calcElementCenter({ x, y, w, h, angle }), angle);
      rotateActionList.push({
        center: calcElementCenter(elemSize),
        angle,
        radian: parseAngleToRadian(angle)
      });
    } else {
      const elemSize: ElementSize = { x: totalX, y: totalY, w, h, angle };
      ves = getElementVertexes(elemSize);
      for (let aIdx = 0; aIdx < rotateActionList.length; aIdx++) {
        const { center, radian } = rotateActionList[aIdx];
        ves = rotateVertexes(center, ves, radian);
      }
      const vesCenter = calcElementCenterFromVertexes(ves);
      if (angle > 0 || angle < 0) {
        const radian = parseAngleToRadian(angle);
        ves = rotateVertexes(vesCenter, ves, radian);
      }
      rotateActionList.push({
        center: vesCenter,
        angle,
        radian: parseAngleToRadian(angle)
      });
    }

    vesList.push(ves);
  }
  return vesList;
}

export function calcElementVertexesQueueInGroup(targetElem: ElementSize, opts: { groupQueue: Element<'group'>[] }): ViewRectVertexes[] {
  const { groupQueue } = opts;
  const elemQueue = [...groupQueue, ...[targetElem]];
  const vesList = calcElementQueueVertexesQueueInGroup(elemQueue);
  return vesList;
}

export function calcElementVertexesInGroup(targetElem: ElementSize, opts: { groupQueue: Element<'group'>[] }): ViewRectVertexes | null {
  const vesList = calcElementVertexesQueueInGroup(targetElem, opts);
  const ves = vesList.pop();
  return ves || null;
}
