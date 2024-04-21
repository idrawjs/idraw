import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewElementSize } from '@idraw/util';
import { createColorStyle } from './color';
import { drawBoxShadow, getOpacity } from './box';

export function drawCircle(ctx: ViewContext2D, elem: Element<'circle'>, opts: RendererDrawElementOptions) {
  const { detail, angle } = elem;
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { background = '#000000', borderColor = '#000000', boxSizing, borderWidth = 0, borderDash } = detail;
  let bw: number = 0;
  if (typeof borderWidth === 'number' && borderWidth > 0) {
    bw = borderWidth as number;
  } else if (Array.isArray(borderWidth) && typeof borderWidth[0] === 'number' && borderWidth[0] > 0) {
    bw = borderWidth[0] as number;
  }
  bw = bw * viewScaleInfo.scale;

  // const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const { x, y, w, h } = calcViewElementSize({ x: elem.x, y: elem.y, w: elem.w, h: elem.h }, { viewScaleInfo }) || elem;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBoxShadow(ctx, viewElem, {
      viewScaleInfo,
      viewSizeInfo,
      renderContent: () => {
        let a = w / 2;
        let b = h / 2;
        // 'content-box'
        const centerX = x + a;
        const centerY = y + b;
        const radiusA = a;
        const radiusB = b;
        if (bw > 0) {
          if (boxSizing === 'content-box') {
            a = a;
            b = b;
          } else if (boxSizing === 'center-line') {
            a = a - bw / 2;
            b = b - bw / 2;
          } else {
            // 'border-box'
            a = a - bw;
            b = b - bw;
          }
        }

        if (a >= 0 && b >= 0) {
          const opacity = getOpacity(viewElem) * parentOpacity;
          ctx.globalAlpha = opacity;

          // draw content
          ctx.beginPath();
          const fillStyle = createColorStyle(ctx, background, {
            viewElementSize: { x, y, w, h },
            viewScaleInfo,
            opacity: ctx.globalAlpha
          });
          ctx.fillStyle = fillStyle;
          ctx.circle(centerX, centerY, radiusA, radiusB, 0, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = parentOpacity;

          // draw border
          if (typeof bw === 'number' && bw > 0) {
            const ba = bw / 2 + a;
            const bb = bw / 2 + b;
            ctx.beginPath();
            if (borderDash) {
              const lineDash = borderDash.map((n) => n * viewScaleInfo.scale);
              ctx.setLineDash(lineDash);
            }
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bw;
            ctx.circle(centerX, centerY, ba, bb, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    });
  });
}
