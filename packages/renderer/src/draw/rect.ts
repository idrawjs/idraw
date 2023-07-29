import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement } from '@idraw/util';
import { drawBox, drawBoxShadow } from './base';

export function drawRect(ctx: ViewContext2D, elem: Element<'rect'>, opts: RendererDrawElementOptions) {
  const { calculator, viewScaleInfo, viewSizeInfo } = opts;
  let { x, y, w, h, angle } = calculator.elementSize(elem, viewScaleInfo, viewSizeInfo);

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
            // empty
          }
        });
      }
    });
  });
}
