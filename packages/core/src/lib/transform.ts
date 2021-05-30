import {
  TypeContext,
  TypePoint,
  TypeElement,
  TypeElemDesc,
} from '@idraw/types';
import { calcElementCenter, parseAngleToRadian } from './calculate';

function rotateElement(
  ctx: TypeContext,
  elem: TypeElement<keyof TypeElemDesc>,
  callback: (ctx: TypeContext) => void
) {
  const center: TypePoint = calcElementCenter(elem);
  const radian = parseAngleToRadian(elem.angle || 0);
  return rotateContext(ctx, center, radian || 0, callback);
}


function rotateContext(
  ctx: TypeContext,
  center: TypePoint | undefined,
  radian: number,
  callback: (ctx: TypeContext) => void
): void {
  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(radian);
    ctx.translate(- center.x, - center.y);
  }

  callback(ctx);

  if (center && (radian > 0 || radian < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(- radian);
    ctx.translate(- center.x, - center.y);
  }
}

export {
  rotateContext,
  rotateElement,
}