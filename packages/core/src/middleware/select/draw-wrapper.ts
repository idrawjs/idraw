import type { Element, ElementSize, ElementType, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';

const wrapperColor = '#1973ba';

export function drawPointWrapper(ctx: ViewContext2D, elem: ElementSize, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 0;
  let { x, y, w, h } = elem;
  const { angle } = elem;

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

export function drawHoverWrapper(ctx: ViewContext2D, elem: ElementSize, opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  const bw = 0;
  let { x, y, w, h } = elem;
  const { angle } = elem;
  if (opts?.calculator) {
    const { calculator } = opts;
    const size = calculator.elementSize({ x, y, w, h, angle }, opts);
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

type ControllerStyle = ElementSize & {
  borderWidth: number;
  borderColor: string;
  bgColor: string;
};

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
  const { angle } = elem;
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

    const ctrlSize = 8;
    const ctrlBgColor = '#FFFFFF';
    const ctrlBorderWidth = 2;
    const ctrlBorderColor = wrapperColor;

    const sizeControllers: Record<string, ControllerStyle> = {
      topLeft: {
        x: x - bw - ctrlSize / 2,
        y: y - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      top: {
        x: x - bw + w / 2 - ctrlSize / 2,
        y: y - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      topRight: {
        x: x + w - bw - ctrlSize / 2,
        y: y - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      right: {
        x: x + w - bw - ctrlSize / 2,
        y: y + h / 2 - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      bottomRight: {
        x: x + w - bw - ctrlSize / 2,
        y: y + h - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      bottom: {
        x: x + w / 2 - bw - ctrlSize / 2,
        y: y + h - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      bottomLeft: {
        x: x - bw - ctrlSize / 2,
        y: y + h - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      },
      left: {
        x: x - bw - ctrlSize / 2,
        y: y + h / 2 - bw - ctrlSize / 2,
        w: ctrlSize,
        h: ctrlSize,
        borderWidth: ctrlBorderWidth,
        borderColor: ctrlBorderColor,
        bgColor: ctrlBgColor
      }
    };

    Object.keys(sizeControllers).forEach((name: string) => {
      const ctrl = sizeControllers[name];
      drawController(ctx, { ...ctrl, ...{} });
    });
  });
}
