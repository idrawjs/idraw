import type { Element, RendererDrawElementOptions } from '@idraw/types';

export function drawImage(ctx: CanvasRenderingContext2D, elem: Element<'image'>, opts: RendererDrawElementOptions) {
  const content = opts.loader.getContent(elem.uuid);
  const { calculator, scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = opts;
  const { x, y, w, h } = calculator.elementSize({ x: elem.x, y: elem.y, w: elem.w, h: elem.h }, { scale, offsetTop, offsetBottom, offsetLeft, offsetRight });

  if (!content) {
    opts.loader.load(elem as Element<'image'>);
  }
  if (elem.type === 'image' && content) {
    ctx.drawImage(content, x, y, w, h);
  }
}
