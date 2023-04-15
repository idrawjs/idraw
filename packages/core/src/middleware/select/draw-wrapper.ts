import type { Element, ElementType, RendererDrawElementOptions } from '@idraw/types';

export function drawPointWrapper(ctx: CanvasRenderingContext2D, elem: Element<ElementType>, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 2;
  let { x, y, w, h } = elem;

  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h }, opts);
    x = size.x;
    y = size.y;
    w = size.w;
    h = size.h;
  }

  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e91e2f';

  ctx.beginPath();
  ctx.moveTo(x - bw, y - bw);
  ctx.lineTo(x + w + bw, y - bw);
  ctx.lineTo(x + w + bw, y + h + bw);
  ctx.lineTo(x - bw, y + h + bw);
  ctx.lineTo(x - bw, y - bw);
  ctx.closePath();
  ctx.stroke();
}

export function drawHoverWrapper(ctx: CanvasRenderingContext2D, elem: Element<ElementType>, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 2;
  let { x, y, w, h } = elem;
  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h }, opts);
    x = size.x;
    y = size.y;
    w = size.w;
    h = size.h;
  }
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e91e2f';
  ctx.beginPath();
  ctx.moveTo(x - bw, y - bw);
  ctx.lineTo(x + w + bw, y - bw);
  ctx.lineTo(x + w + bw, y + h + bw);
  ctx.lineTo(x - bw, y + h + bw);
  ctx.lineTo(x - bw, y - bw);
  ctx.closePath();
  ctx.stroke();
}
