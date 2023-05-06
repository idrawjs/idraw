import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';

export function drawSVG(ctx: ViewContext2D, elem: Element<'svg'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem.uuid);
  const { calculator, scaleInfo } = opts;
  const { x, y, w, h, angle } = calculator.elementSize(elem, scaleInfo);
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    if (!content) {
      opts.loader.load(elem as Element<'svg'>);
    }
    if (elem.type === 'svg' && content) {
      ctx.drawImage(content, x, y, w, h);
    }
  });
}
