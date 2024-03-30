import type { RendererDrawElementOptions, ViewContext2D, DataLayout, Element } from '@idraw/types';
import { calcViewElementSize, calcViewBoxSize } from '@idraw/util';
import { drawBoxShadow, drawBoxBackground, drawBoxBorder } from './box';

export function drawLayout(ctx: ViewContext2D, layout: DataLayout, opts: RendererDrawElementOptions, renderContent: (ctx: ViewContext2D) => void) {
  const { viewScaleInfo, viewSizeInfo, parentOpacity } = opts;
  const elem: Element = { uuid: 'layout', type: 'group', ...layout };
  const { x, y, w, h } = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo }) || elem;
  const angle = 0;
  const viewElem: Element = { ...elem, ...{ x, y, w, h, angle } } as Element;
  ctx.globalAlpha = 1;
  drawBoxShadow(ctx, viewElem, {
    viewScaleInfo,
    viewSizeInfo,
    renderContent: () => {
      drawBoxBackground(ctx, viewElem, { viewScaleInfo, viewSizeInfo });
    }
  });

  if (layout.detail.overflow === 'hidden') {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const elem: Element<'group'> = { uuid: 'layout', type: 'group', ...layout } as Element<'group'>;
    const viewElemSize = calcViewElementSize(elem, { viewScaleInfo, viewSizeInfo }) || elem;
    const viewElem = { ...elem, ...viewElemSize };
    const { x, y, w, h, radiusList } = calcViewBoxSize(viewElem, {
      viewScaleInfo,
      viewSizeInfo
    });
    ctx.save();

    ctx.fillStyle = 'transparent';
    ctx.beginPath();
    ctx.moveTo(x + radiusList[0], y);
    ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
    ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
    ctx.arcTo(x, y + h, x, y, radiusList[3]);
    ctx.arcTo(x, y, x + w, y, radiusList[0]);
    ctx.closePath();
    ctx.fill();
    ctx.clip();
  }

  renderContent(ctx);

  if (layout.detail.overflow === 'hidden') {
    ctx.restore();
  }

  drawBoxBorder(ctx, viewElem, { viewScaleInfo, viewSizeInfo });
  ctx.globalAlpha = parentOpacity;
}
