import {
  TypeContext,
  TypeElemDesc,
  TypeElement,
} from '@idraw/types';
import util from '@idraw/util';
import { rotateElement } from './../transform';

const { istype } = util;

export function clearContext(ctx: TypeContext) {
  ctx.setFillStyle('rgb(0 0 0 / 0%)');
  ctx.setStrokeStyle('rgb(0 0 0 / 0%)');
}

export function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.width, size.height);
}

export function drawBox(
  ctx: TypeContext,
  elem: TypeElement<keyof TypeElemDesc>,
  pattern: string | CanvasPattern | null
): void {
  clearContext(ctx);
  rotateElement(ctx, elem, () => {
    const r: number = elem.radius || 0;
    const { x, y, w, h } = elem;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();  
    if (typeof pattern === 'string') {
      ctx.setFillStyle(pattern);      
    } else if (['CanvasPattern'].includes(istype.type(pattern))) {
      ctx.setFillStyle(pattern as CanvasPattern);
    }
    ctx.fill(); 
  })
}
