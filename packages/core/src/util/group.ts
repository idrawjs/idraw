import type { Element, ElementSize } from '@idraw/types';

export function calcElementSizeInGroup(elem: ElementSize, groupQueue: Element<'group'>[]): ElementSize {
  let x = 0;
  let y = 0;
  let angle = 0;

  groupQueue.forEach((group: Element<'group'>) => {
    x += group.x;
    y += group.y;
    angle += group.angle || 0;
  });
  x += elem.x;
  y += elem.y;
  angle += elem.angle || 0;
  const elemSize = { x, y, w: elem.w, h: elem.h, angle };
  return elemSize;
}
