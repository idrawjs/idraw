import {
  TypeContext,
  TypePoint,
  TypeElement,
  TypeElemDesc,
} from '@idraw/types';
import { calcElementCenter, translateRotateAngle } from './calculate';

function rotateElement(
  ctx: TypeContext,
  elem: TypeElement<keyof TypeElemDesc>,
  callback: (ctx: TypeContext) => void
) {
  const center: TypePoint = calcElementCenter(elem);
  const angle = translateRotateAngle(elem.angle);
  return rotateContext(ctx, center, angle || 0, callback);
}


function rotateContext(
  ctx: TypeContext,
  center: TypePoint | undefined,
  angle: number,
  callback: (ctx: TypeContext) => void
): void {
  if (center && (angle > 0 || angle < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);
    ctx.translate(- center.x, - center.y);
  }

  callback(ctx);

  if (center && (angle > 0 || angle < 0)) {
    ctx.translate(center.x, center.y);
    ctx.rotate(- angle);
    ctx.translate(- center.x, - center.y);
  }
}

export {
  rotateContext,
  rotateElement,
}