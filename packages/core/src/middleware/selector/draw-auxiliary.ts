import type { ViewContext2D, ViewRectVertexes, Element, ViewScaleInfo } from '@idraw/types';
import { getElementViewRectInfo } from './auxiliary';
import { auxiliaryColor } from './config';
import { drawLine, drawCrossByCenter } from './draw-base';

export function drawAuxiliaryLines(
  ctx: ViewContext2D,
  opts: {
    vertexes: ViewRectVertexes;
    element: Element | null;
    groupQueue: Element<'group'>[];
    viewScaleInfo: ViewScaleInfo;
  }
) {
  const { element, groupQueue, viewScaleInfo } = opts;
  if (!element) {
    return;
  }
  const viewRectInfo = getElementViewRectInfo(element, {
    groupQueue,
    viewScaleInfo
  });
  const lineOpts = {
    borderColor: auxiliaryColor,
    borderWidth: 1,
    lineDash: []
  };
  drawLine(ctx, viewRectInfo.topLeft, viewRectInfo.topRight, lineOpts);
  drawLine(ctx, viewRectInfo.topRight, viewRectInfo.bottomRight, lineOpts);
  drawLine(ctx, viewRectInfo.bottomRight, viewRectInfo.bottomLeft, lineOpts);
  drawLine(ctx, viewRectInfo.bottomLeft, viewRectInfo.topLeft, lineOpts);

  const crossOpts = { ...lineOpts, size: 6 };

  drawCrossByCenter(ctx, viewRectInfo.topLeft, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.topRight, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottomLeft, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottomRight, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.top, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.right, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottom, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.left, crossOpts);
}
