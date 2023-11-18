import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewBoxSize } from '@idraw/util';
import { drawBox, drawBoxShadow } from './box';

export function drawImage(ctx: ViewContext2D, elem: Element<'image'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem);
  const { calculator, viewScaleInfo, viewSizeInfo } = opts;
  const { x, y, w, h, angle } = calculator.elementSize(elem, viewScaleInfo, viewSizeInfo);

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
          renderContent: () => {
            if (!content) {
              opts.loader.load(elem as Element<'image'>, opts.elementAssets || {});
            }
            if (elem.type === 'image' && content) {
              const { opacity } = elem.detail;
              ctx.globalAlpha = opacity ? opacity : 1;
              const { x, y, w, h, radiusList } = calcViewBoxSize(viewElem, {
                viewScaleInfo,
                viewSizeInfo
              });

              ctx.save();

              ctx.beginPath();
              ctx.moveTo(x + radiusList[0], y);
              ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
              ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
              ctx.arcTo(x, y + h, x, y, radiusList[3]);
              ctx.arcTo(x, y, x + w, y, radiusList[0]);
              ctx.closePath();
              ctx.fill();
              ctx.clip();
              ctx.drawImage(content, x, y, w, h);
              ctx.globalAlpha = 1;

              ctx.restore();
            }
          }
        });
      }
    });
  });
}
