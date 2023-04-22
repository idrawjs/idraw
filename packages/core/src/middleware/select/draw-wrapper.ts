import type { Element, ElementSize, ElementType, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, rotateElementVertexes } from '@idraw/util';
import { calcElementControllerStyle } from './controller';
import type { ControllerStyle } from './controller';

const wrapperColor = '#1973ba';

export function drawPointWrapper(ctx: CanvasRenderingContext2D | ViewContext2D, elem: ElementSize, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 0;
  let { x, y, w, h } = elem;
  const { angle = 0 } = elem;

  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h }, opts);
    x = size.x;
    y = size.y;
    w = size.w;
    h = size.h;
  }

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = wrapperColor;

    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();
  });
}

export function drawHoverWrapper(ctx: CanvasRenderingContext2D | ViewContext2D, elem: ElementSize, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 0;
  let { x, y, w, h } = elem;
  const { angle = 0 } = elem;
  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h }, opts);
    x = size.x;
    y = size.y;
    w = size.w;
    h = size.h;
  }

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    // ctx.setLineDash([4, 4]);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = wrapperColor;
    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();
  });
}

function drawController(ctx: CanvasRenderingContext2D | ViewContext2D, style: ControllerStyle) {
  const { x, y, w, h, borderColor, borderWidth, bgColor } = style;

  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

export function drawElementControllers(
  ctx: CanvasRenderingContext2D | ViewContext2D,
  elem: Element<ElementType>,
  opts?: Omit<RendererDrawElementOptions, 'loader'>
) {
  const bw = 0;
  let { x, y, w, h } = elem;
  const { angle = 0 } = elem;

  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h }, opts);
    x = size.x;
    y = size.y;
    w = size.w;
    h = size.h;
  }

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = wrapperColor;

    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();

    const sizeControllers: Record<string, ControllerStyle> = calcElementControllerStyle({ x, y, w, h, angle });

    Object.keys(sizeControllers).forEach((name: string) => {
      const ctrl = sizeControllers[name];
      drawController(ctx, { ...ctrl, ...{} });
    });
  });
}

export function drawElementListShadows(
  ctx: CanvasRenderingContext2D | ViewContext2D,
  elements: Element<ElementType>[],
  opts?: Omit<RendererDrawElementOptions, 'loader'>
) {
  elements.forEach((elem) => {
    let { x, y, w, h } = elem;
    const { angle = 0 } = elem;
    if (opts?.calculator) {
      const { calculator } = opts;
      const size = calculator.elementSize({ x, y, w, h }, opts);
      x = size.x;
      y = size.y;
      w = size.w;
      h = size.h;
    }

    const vertexes = rotateElementVertexes({ x, y, w, h, angle });

    if (vertexes.length >= 2) {
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#aaaaaa';
      ctx.fillStyle = '#0000001A';
      ctx.beginPath();
      ctx.moveTo(vertexes[0].x, vertexes[0].y);
      for (let i = 0; i < vertexes.length; i++) {
        const p = vertexes[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
  });
}
