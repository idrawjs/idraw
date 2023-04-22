import type { ViewContext2D, PointSize, ElementSize } from '@idraw/types';

export function parseRadianToAngle(radian: number): number {
  return (radian / Math.PI) * 180;
}

export function parseAngleToRadian(angle: number): number {
  return (angle / 180) * Math.PI;
}

export function calcElementRotateCenter(elem: ElementSize): PointSize {
  const p = {
    x: elem.x + elem.w / 2,
    y: elem.y + elem.h / 2
  };
  return p;
}

export function rotateElement(
  ctx: ViewContext2D | CanvasRenderingContext2D,
  elemSize: ElementSize,
  callback: (ctx: ViewContext2D | CanvasRenderingContext2D) => void
): void {
  const center = calcElementRotateCenter(elemSize);
  const radian = parseAngleToRadian(elemSize.angle || 0);
  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(radian);
    ctx.translate(-center.x, -center.y);
  }

  callback(ctx);

  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(-radian);
    ctx.translate(-center.x, -center.y);
  }
}
