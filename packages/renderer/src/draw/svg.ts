import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';

export function drawSVG(ctx: ViewContext2D, elem: Element<'svg'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem);
  const { calculator, viewScaleInfo, viewSizeInfo } = opts;
  const { x, y, w, h, angle } = calculator?.elementSize(elem, viewScaleInfo, viewSizeInfo) || elem;
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    if (!content) {
      opts.loader.load(elem as Element<'svg'>, opts.elementAssets || {});
    }
    if (elem.type === 'svg' && content) {
      const { opacity } = elem.detail;
      ctx.globalAlpha = opacity ? opacity : 1;
      ctx.drawImage(content, x, y, w, h);
      ctx.globalAlpha = 1;
    }
  });
}
