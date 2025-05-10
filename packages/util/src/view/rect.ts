import type { ElementSize } from '@idraw/types';

export function checkRectIntersect(rect1: ElementSize, rect2: ElementSize) {
  const rect1MinX = rect1.x;
  const rect1MinY = rect1.y;
  const rect1MaxX = rect1.x + rect1.w;
  const rect1MaxY = rect1.y + rect1.h;

  const rect2MinX = rect2.x;
  const rect2MinY = rect2.y;
  const rect2MaxX = rect2.x + rect2.w;
  const rect2MaxY = rect2.y + rect2.h;

  return rect1MinX <= rect2MaxX && rect1MaxX >= rect2MinX && rect1MinY <= rect2MaxY && rect1MaxY >= rect2MinY;
}
