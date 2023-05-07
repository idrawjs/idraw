import { ViewContext2D, Element, ElementType } from '@idraw/types';
import { is, istype, isColorStr } from '@idraw/util';

// export function clearContext(ctx: ViewContext2D) {
//   ctx.fillStyle = '#000000';
//   ctx.strokeStyle = '#000000';
//   ctx.setLineDash([]);
//   ctx.globalAlpha = 1;
//   ctx.shadowColor = '#00000000';
//   ctx.shadowOffsetX = 0;
//   ctx.shadowOffsetY = 0;
//   ctx.shadowBlur = 0;
// }

export function drawBox(ctx: ViewContext2D, elem: Element<ElementType>, pattern?: string | CanvasPattern | null): void {
  drawBoxBorder(ctx, elem);
  if (!pattern) {
    return;
  }
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
    ctx.fillStyle = pattern;
  } else if (['CanvasPattern'].includes(istype.type(pattern))) {
    ctx.fillStyle = pattern as CanvasPattern;
  }
  ctx.fill();
}

export function drawBoxBorder(ctx: ViewContext2D, elem: Element<ElementType>): void {
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
    ctx.shadowColor = desc.shadowColor;
  }
  if (desc.shadowOffsetX !== undefined && is.number(desc.shadowOffsetX)) {
    ctx.shadowOffsetX = desc.shadowOffsetX;
  }
  if (desc.shadowOffsetY !== undefined && is.number(desc.shadowOffsetY)) {
    ctx.shadowOffsetY = desc.shadowOffsetY;
  }
  if (desc.shadowBlur !== undefined && is.number(desc.shadowBlur)) {
    ctx.shadowBlur = desc.shadowBlur;
  }
  ctx.beginPath();
  ctx.lineWidth = bw;
  ctx.strokeStyle = borderColor;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}
