import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, generateSVGPath, calcViewElementSize } from '@idraw/util';
import { drawBox, drawBoxShadow } from './box';

export function drawPath(ctx: ViewContext2D, elem: Element<'path'>, opts: RendererDrawElementOptions) {
  const { detail } = elem;
  const { originX, originY, originW, originH } = detail;
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calcViewElementSize(elem, { viewScaleInfo }) || elem;
  const scaleW = w / originW;
  const scaleH = h / originH;
  const viewOriginX = originX * scaleW;
  const viewOriginY = originY * scaleH;
  const internalX = x - viewOriginX;
  const internalY = y - viewOriginY;

  const scaleNum = viewScaleInfo.scale * viewSizeInfo.devicePixelRatio;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
  // rotateElement(ctx, { x: viewOriginX, y: viewOriginY, w, h, angle }, () => {
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBox(ctx, viewElem, {
      originElem: elem,
      calcElemSize: { x, y, w, h, angle },
      viewScaleInfo,
      viewSizeInfo,
      parentOpacity,
      renderContent: () => {
        drawBoxShadow(ctx, viewElem, {
          viewScaleInfo,
          viewSizeInfo,
          renderContent: () => {
            ctx.save();
            ctx.translate(internalX, internalY);
            // ctx.beginPath();
            // ctx.moveTo(viewOriginX, viewOriginY);
            // ctx.lineTo(viewOriginX + w, viewOriginY);
            // ctx.lineTo(viewOriginX + w, viewOriginY + h);
            // ctx.lineTo(viewOriginX, viewOriginY + h);
            // ctx.closePath();
            // ctx.clip();
            ctx.scale((scaleNum * scaleW) / viewScaleInfo.scale, (scaleNum * scaleH) / viewScaleInfo.scale);
            const pathStr = generateSVGPath(detail.commands || []);
            const path2d = new Path2D(pathStr);
            if (detail.fill) {
              ctx.fillStyle = detail.fill;
              ctx.fill(path2d);
            }

            if (detail.stroke && detail.strokeWidth !== 0) {
              ctx.strokeStyle = detail.stroke;
              ctx.lineWidth = (detail.strokeWidth || 1) / viewSizeInfo.devicePixelRatio;
              ctx.lineCap = detail.strokeLineCap || 'square';
              ctx.stroke(path2d);
            }
            ctx.translate(-internalX, -internalY);
            ctx.restore();
          }
        });
      }
    });
  });
}
