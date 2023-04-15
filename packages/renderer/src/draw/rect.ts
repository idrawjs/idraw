import type { Element, RendererDrawElementOptions } from '@idraw/types';

export function drawRect(ctx: CanvasRenderingContext2D, elem: Element<'rect'>, opts: RendererDrawElementOptions) {
  // const { desc } = elem;
  const { calculator, scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = opts;
  const { x, y, w, h } = calculator.elementSize({ x: elem.x, y: elem.y, w: elem.w, h: elem.h }, { scale, offsetTop, offsetBottom, offsetLeft, offsetRight });

  let r: number = (elem.desc.borderRadius || 0) * scale;
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
  ctx.fillStyle = elem.desc.bgColor || '#000000';
  ctx.fill();
}
