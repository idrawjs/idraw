import { IDrawContext, Point, DataElement, DataElemDesc } from '@idraw/types';
import { calcElementCenter, parseAngleToRadian } from './calculate';

function rotateElement(
  ctx: IDrawContext,
  elem: DataElement<keyof DataElemDesc>,
  callback: (ctx: IDrawContext) => void
): void {
  const center: Point = calcElementCenter(elem);
  const radian = parseAngleToRadian(elem.angle || 0);
  return rotateContext(ctx, center, radian || 0, callback);
}

function rotateContext(
  ctx: IDrawContext,
  center: Point | undefined,
  radian: number,
  callback: (ctx: IDrawContext) => void
): void {
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

export { rotateContext, rotateElement };
