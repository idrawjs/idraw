import type { Point, StrictMaterial } from '@idraw/types';
import { rotatePointInGroup } from './rotate';

export function calcPointMoveMaterialInGroup(
  start: Point,
  end: Point,
  groupQueue: StrictMaterial<'group'>[]
): { moveX: number; moveY: number } {
  let moveX = end.x - start.x;
  let moveY = end.y - start.y;
  const pointGroupQueue: StrictMaterial<'group'>[] = [];
  groupQueue.forEach((group) => {
    const { x, y, width, height, angle = 0 } = group;
    pointGroupQueue.push({
      x,
      y,
      width,
      height,
      angle: 0 - angle,
    } as StrictMaterial<'group'>);
  });

  if (groupQueue?.length > 0) {
    const startInGroup = rotatePointInGroup(start, pointGroupQueue);
    const endInGroup = rotatePointInGroup(end, pointGroupQueue);
    moveX = endInGroup.x - startInGroup.x;
    moveY = endInGroup.y - startInGroup.y;
  }

  return {
    moveX,
    moveY,
  };
}
