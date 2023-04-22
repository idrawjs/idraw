import type { Element, RendererDrawElementOptions } from '@idraw/types';
import { rotateElement } from '@idraw/util';

export function drawImage(ctx: CanvasRenderingContext2D, elem: Element<'image'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem.uuid);
  const { calculator, scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = opts;
  const { x, y, w, h, angle } = calculator.elementSize(elem, { scale, offsetTop, offsetBottom, offsetLeft, offsetRight });
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    if (!content) {
      opts.loader.load(elem as Element<'image'>);
    }
    if (elem.type === 'image' && content) {
      ctx.drawImage(content, x, y, w, h);
    }
  });
}
