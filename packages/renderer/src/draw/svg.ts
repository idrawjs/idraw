import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewElementSize } from '@idraw/util';
import { getOpacity } from './box';

export function drawSVG(ctx: ViewContext2D, elem: Element<'svg'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem);
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo }) || elem;
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    if (!content && !opts.loader.isDestroyed()) {
      opts.loader.load(elem as Element<'svg'>, opts.elementAssets || {});
    }
    if (elem.type === 'svg' && content) {
      ctx.globalAlpha = getOpacity(elem) * parentOpacity;
      ctx.drawImage(content, x, y, w, h);
      ctx.globalAlpha = parentOpacity;
    }
  });
}
