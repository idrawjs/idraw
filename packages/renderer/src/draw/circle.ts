import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';
import { createColorStyle } from './color';

export function drawCircle(ctx: ViewContext2D, elem: Element<'circle'>, opts: RendererDrawElementOptions) {
  const { detail, angle } = elem;
  const { background = '#000000', borderColor = '#000000', borderWidth = 0 } = detail;
  const { calculator, viewScaleInfo, viewSizeInfo } = opts;
  // const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const { x, y, w, h } = calculator.elementSize({ x: elem.x, y: elem.y, w: elem.w, h: elem.h }, viewScaleInfo, viewSizeInfo);
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    const a = w / 2;
    const b = h / 2;
    const centerX = x + a;
    const centerY = y + b;

    if (elem?.detail?.opacity !== undefined && elem?.detail?.opacity >= 0) {
      ctx.globalAlpha = elem.detail.opacity;
    } else {
      ctx.globalAlpha = 1;
    }

    // draw border
    if (typeof borderWidth === 'number' && borderWidth > 0) {
      const ba = borderWidth / 2 + a;
      const bb = borderWidth / 2 + b;
      ctx.beginPath();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.circle(centerX, centerY, ba, bb, 0, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
    }

    // draw content
    ctx.beginPath();
    const fillStyle = createColorStyle(ctx, background, {
      viewElementSize: { x, y, w, h },
      viewScaleInfo,
      opacity: ctx.globalAlpha
    });
    ctx.fillStyle = fillStyle;
    ctx.circle(centerX, centerY, a, b, 0, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}
