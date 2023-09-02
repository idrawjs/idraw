import type { Data, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';

import { drawElement } from './group';

export function drawElementList(ctx: ViewContext2D, data: Data, opts: RendererDrawElementOptions) {
  const { elements = [] } = data;
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    // TODO
    if (!opts.calculator.isElementInView(elem, opts.viewScaleInfo, opts.viewSizeInfo)) {
      continue;
    }
    try {
      drawElement(ctx, elem, opts);
    } catch (err) {
      console.error(err);
    }
  }
}
