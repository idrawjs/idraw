import type { RendererDrawElementOptions, ViewContext2D, DataUnderlay } from '@idraw/types';
import { calcViewElementSize } from '@idraw/util';
import { drawBox, drawBoxShadow } from './box';

export function drawUnderlay(ctx: ViewContext2D, underlay: DataUnderlay, opts: RendererDrawElementOptions) {
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const elem = { uuid: 'underlay', ...underlay };
  const { x, y, w, h } = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo }) || elem;
  const angle = 0;
  const viewElem = { ...elem, ...{ x, y, w, h, angle } };
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
}
