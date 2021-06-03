import {
  TypeContext,
  TypeElemDesc,
  TypeElement,
} from '@idraw/types';
import util from '@idraw/util';
import { rotateElement } from './../transform';

const { istype, color } = util;

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
  pattern: string | CanvasPattern | null,
): void {
  clearContext(ctx);
  drawBoxBorder(ctx, elem);
  rotateElement(ctx, elem, () => {
    const { x, y, w, h } = elem;
    let r: number = elem.borderRadius || 0;
    r = Math.min(r, w / 2, h / 2);
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
  });
}


export function drawBoxBorder(
  ctx: TypeContext,
  elem: TypeElement<keyof TypeElemDesc>,
): void {
  clearContext(ctx);
  rotateElement(ctx, elem, () => {
    if (!(elem.borderWidth && elem.borderWidth > 0)) {
      return;
    }
    let bw = elem.borderWidth;
    let borderColor: string = '#000000';
    if (color.isColorStr(elem.borderColor) === true) {
      borderColor = elem.borderColor as string;
    }
    const x = elem.x - bw / 2;
    const y = elem.y - bw / 2;
    const w = elem.w + bw;
    const h = elem.h + bw;

    let r: number = elem.borderRadius || 0;
    r = Math.min(r, w / 2, h / 2);
    if (r < w / 2 && r < h / 2) {
      r = r + bw / 2
    }
    ctx.beginPath();
    ctx.setLineWidth(bw);
    ctx.setStrokeStyle(borderColor)
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();  
    ctx.stroke(); 
  })
} 