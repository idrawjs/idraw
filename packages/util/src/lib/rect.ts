import type { ElementSize } from '@idraw/types';

export function checkRectIntersect(rect1: ElementSize, rect2: ElementSize) {
  const react1MinX = rect1.x;
  const react1MinY = rect1.y;
  const react1MaxX = rect1.x + rect1.w;
  const react1MaxY = rect1.y + rect1.h;

  const react2MinX = rect2.x;
  const react2MinY = rect2.y;
  const react2MaxX = rect2.x + rect2.w;
  const react2MaxY = rect2.y + rect2.h;

  return react1MinX <= react2MaxX && react1MaxX >= react2MinX && react1MinY <= react2MaxY && react1MaxY >= react2MinY;
}
