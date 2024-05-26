import type { Element, RendererDrawElementOptions, ViewContext2D, LoadContent } from '@idraw/types';
import { rotateElement, calcViewBoxSize, calcViewElementSize } from '@idraw/util';
import { drawBox, drawBoxShadow, getOpacity } from './box';

export function drawImage(ctx: ViewContext2D, elem: Element<'image'>, opts: RendererDrawElementOptions) {
  const content: LoadContent | HTMLCanvasElement | OffscreenCanvas | null = opts.loader.getContent(elem);
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calcViewElementSize(elem, { viewScaleInfo }) || elem;

  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    drawBoxShadow(ctx, viewElem, {
      viewScaleInfo,
      viewSizeInfo,
      renderContent: () => {
        drawBox(ctx, viewElem, {
          originElem: elem,
          calcElemSize: { x, y, w, h, angle },
          viewScaleInfo,
          viewSizeInfo,
          parentOpacity,
          renderContent: () => {
            if (!content && !opts.loader.isDestroyed()) {
              opts.loader.load(elem as Element<'image'>, opts.elementAssets || {});
            }
            if (elem.type === 'image' && content) {
              ctx.globalAlpha = getOpacity(elem) * parentOpacity;
              const { x, y, w, h, radiusList } = calcViewBoxSize(viewElem, {
                viewScaleInfo,
                viewSizeInfo
              });
              const { detail } = elem;
              const { scaleMode, originW = 0, originH = 0 } = detail;
              const imageW = ctx.$undoPixelRatio(originW);
              const imageH = ctx.$undoPixelRatio(originH);

              ctx.save();
              ctx.fillStyle = 'transparent';
              ctx.beginPath();
              ctx.moveTo(x + radiusList[0], y);
              ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
              ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
              ctx.arcTo(x, y + h, x, y, radiusList[3]);
              ctx.arcTo(x, y, x + w, y, radiusList[0]);
              ctx.closePath();
              ctx.fill();
              ctx.clip();

              if (scaleMode && originH && originW) {
                let sx = 0;
                let sy = 0;
                let sWidth = imageW;
                let sHeight = imageH;
                const dx = x;
                const dy = y;
                const dWidth = w;
                const dHeight = h;

                if (imageW > elem.w || imageH > elem.h) {
                  if (scaleMode === 'fill') {
                    const sourceScale = Math.max(elem.w / imageW, elem.h / imageH);
                    const newImageWidth = imageW * sourceScale;
                    const newImageHeight = imageH * sourceScale;
                    sx = (newImageWidth - elem.w) / 2 / sourceScale;
                    sy = (newImageHeight - elem.h) / 2 / sourceScale;
                    sWidth = elem.w / sourceScale;
                    sHeight = elem.h / sourceScale;
                  } else if (scaleMode === 'tile') {
                    sx = 0;
                    sy = 0;
                    sWidth = elem.w;
                    sHeight = elem.h;
                  } else if (scaleMode === 'fit') {
                    const sourceScale = Math.min(elem.w / imageW, elem.h / imageH);
                    sx = (imageW - elem.w / sourceScale) / 2;
                    sy = (imageH - elem.h / sourceScale) / 2;
                    sWidth = elem.w / sourceScale;
                    sHeight = elem.h / sourceScale;
                  }
                }

                ctx.drawImage(content, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
              } else {
                ctx.drawImage(content, x, y, w, h);

                // const sx = 0;
                // const sy = 0;
                // const sWidth = imageW;
                // const sHeight = imageH;
                // const dx = x;
                // const dy = y;
                // const dWidth = w;
                // const dHeight = h;
                // ctx.drawImage(content, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
              }
              // content = null;

              ctx.globalAlpha = parentOpacity;
              ctx.restore();
            }
          }
        });
      }
    });
  });
}
