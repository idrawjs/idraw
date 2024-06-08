import type { Element, RendererDrawElementOptions, ViewContext2D } from '@idraw/types';
import { rotateElement, calcViewElementSize } from '@idraw/util';
import { drawBox, drawBoxShadow } from './box';

export function drawRect(ctx: ViewContext2D, elem: Element<'rect'>, opts: RendererDrawElementOptions) {
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
            // empty
          }
        });
      }
    });
  });
}
