import {
  TypeContext,
  // TypeElemDesc,
  TypeElement,
} from '@idraw/types';
import { is, istype, isColorStr } from '@idraw/util';
import { rotateElement } from './../transform';

export function clearContext(ctx: TypeContext) {
  // ctx.setFillStyle('rgb(0 0 0 / 100%)');
  // ctx.setStrokeStyle('rgb(0 0 0 / 100%)');
  ctx.setFillStyle('#000000');
  ctx.setStrokeStyle('#000000');
  ctx.setLineDash([]);
  ctx.setGlobalAlpha(1);
  ctx.setShadowColor('#00000000');
  ctx.setShadowOffsetX(0)
  ctx.setShadowOffsetY(0);
  ctx.setShadowBlur(0);
}

export function drawBgColor(ctx: TypeContext, color: string) {
  const size = ctx.getSize();
  ctx.setFillStyle(color);
  ctx.fillRect(0, 0, size.contextWidth, size.contextHeight);
}

export function drawBox(
  ctx: TypeContext,
  elem: TypeElement<'text' | 'rect'>,
  pattern: string | CanvasPattern | null,
): void {
  clearContext(ctx);
  drawBoxBorder(ctx, elem);
  clearContext(ctx);
  rotateElement(ctx, elem, () => {
    const { x, y, w, h } = elem;
    let r: number = elem.desc.borderRadius || 0;
    r = Math.min(r, w / 2, h / 2);
    if (w < r * 2 || h < r * 2) {
      r = 0;
    }
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
  elem: TypeElement<'text'|'rect'>,
): void {
  clearContext(ctx);
  rotateElement(ctx, elem, () => {
    if (!(elem.desc.borderWidth && elem.desc.borderWidth > 0)) {
      return;
    }
    const bw = elem.desc.borderWidth;
    let borderColor = '#000000';
    if (isColorStr(elem.desc.borderColor) === true) {
      borderColor = elem.desc.borderColor as string;
    }
    const x = elem.x - bw / 2;
    const y = elem.y - bw / 2;
    const w = elem.w + bw;
    const h = elem.h + bw;

    let r: number = elem.desc.borderRadius || 0;
    r = Math.min(r, w / 2, h / 2);
    if (r < w / 2 && r < h / 2) {
      r = r + bw / 2;
    }
    const { desc } = elem;
    if (desc.shadowColor !== undefined && isColorStr(desc.shadowColor)) {
      ctx.setShadowColor(desc.shadowColor);
    }
    if (desc.shadowOffsetX !== undefined && is.number(desc.shadowOffsetX)) {
      ctx.setShadowOffsetX(desc.shadowOffsetX);
    }
    if (desc.shadowOffsetY !== undefined && is.number(desc.shadowOffsetY)) {
      ctx.setShadowOffsetY(desc.shadowOffsetY);
    }
    if (desc.shadowBlur !== undefined && is.number(desc.shadowBlur)) {
      ctx.setShadowBlur(desc.shadowBlur);
    }
    ctx.beginPath();
    ctx.setLineWidth(bw);
    ctx.setStrokeStyle(borderColor);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();  
    ctx.stroke(); 
  });
} 