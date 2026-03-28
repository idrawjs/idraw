import type { MaterialSize } from '@idraw/types';

export function checkRectIntersect(rect1: MaterialSize, rect2: MaterialSize) {
  const rect1MinX = rect1.x;
  const rect1MinY = rect1.y;
  const rect1MaxX = rect1.x + rect1.width;
  const rect1MaxY = rect1.y + rect1.height;

  const rect2MinX = rect2.x;
  const rect2MinY = rect2.y;
  const rect2MaxX = rect2.x + rect2.width;
  const rect2MaxY = rect2.y + rect2.height;

  return rect1MinX <= rect2MaxX && rect1MaxX >= rect2MinX && rect1MinY <= rect2MaxY && rect1MaxY >= rect2MinY;
}
