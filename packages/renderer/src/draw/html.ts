import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';
import { getOpacity } from './box';

export function drawHTML(ctx: ViewContext2D, elem: Element<'html'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem);
  const { calculator, viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const { x, y, w, h, angle } = calculator?.elementSize(elem, viewScaleInfo, viewSizeInfo) || elem;
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    if (!content) {
      opts.loader.load(elem as Element<'html'>, opts.elementAssets || {});
    }
    if (elem.type === 'html' && content) {
      ctx.globalAlpha = getOpacity(elem) * parentOpacity;
      ctx.drawImage(content, x, y, w, h);
      ctx.globalAlpha = parentOpacity;
    }
  });
}
