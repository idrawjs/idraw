import type { PointSize, Element } from '@idraw/types';
import { rotatePointInGroup } from './rotate';

export function calcPointMoveElementInGroup(start: PointSize, end: PointSize, groupQueue: Element<'group'>[]): { moveX: number; moveY: number } {
  let moveX = end.x - start.x;
  let moveY = end.y - start.y;
  const pointGroupQueue: Element<'group'>[] = [];
  groupQueue.forEach((group) => {
    const { x, y, w, h, angle = 0 } = group;
    pointGroupQueue.push({
      x,
      y,
      w,
      h,
      angle: 0 - angle
    } as Element<'group'>);
  });

  if (groupQueue?.length > 0) {
    const startInGroup = rotatePointInGroup(start, pointGroupQueue);
    const endInGroup = rotatePointInGroup(end, pointGroupQueue);
    moveX = endInGroup.x - startInGroup.x;
    moveY = endInGroup.y - startInGroup.y;
  }

  return {
    moveX,
    moveY
  };
}
