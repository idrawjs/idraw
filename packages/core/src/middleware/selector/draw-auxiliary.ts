import type { ViewContext2D, Element, ViewScaleInfo, ViewSizeInfo, ViewCalculator, ViewRectInfo } from '@idraw/types';
import { auxiliaryColor } from './config';
import { drawLine, drawCrossByCenter } from './draw-base';

interface ViewBoxInfo {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  midX: number;
  midY: number;
}

function getViewBoxInfo(rectInfo: ViewRectInfo): ViewBoxInfo {
  const boxInfo: ViewBoxInfo = {
    minX: rectInfo.topLeft.x,
    minY: rectInfo.topLeft.y,
    maxX: rectInfo.bottomRight.x,
    maxY: rectInfo.bottomRight.y,
    midX: rectInfo.center.x,
    midY: rectInfo.center.y
  };
  return boxInfo;
}

export function drawAuxiliaryExperimentBox(
  ctx: ViewContext2D,
  opts: {
    calculator: ViewCalculator;
    element: Element | null;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  const { element, viewScaleInfo, viewSizeInfo, calculator } = opts;
  if (!element) {
    return;
  }
  const viewRectInfo = calculator.calcViewRectInfoFromRange(element.uuid, { viewScaleInfo, viewSizeInfo });
  if (!viewRectInfo) {
    return;
  }
  const lineOpts = {
    borderColor: auxiliaryColor,
    borderWidth: 1,
    lineDash: []
  };
  // drawLine(ctx, viewRectInfo.topLeft, viewRectInfo.topRight, lineOpts);
  // drawLine(ctx, viewRectInfo.topRight, viewRectInfo.bottomRight, lineOpts);
  // drawLine(ctx, viewRectInfo.bottomRight, viewRectInfo.bottomLeft, lineOpts);
  // drawLine(ctx, viewRectInfo.bottomLeft, viewRectInfo.topLeft, lineOpts);

  // // vLine
  // drawLine(ctx, { x: viewRectInfo.topLeft.x, y: 0 }, { x: viewRectInfo.topLeft.x, y: viewSizeInfo.height }, lineOpts);
  // drawLine(ctx, { x: viewRectInfo.center.x, y: 0 }, { x: viewRectInfo.center.x, y: viewSizeInfo.height }, lineOpts);
  // drawLine(ctx, { x: viewRectInfo.bottomRight.x, y: 0 }, { x: viewRectInfo.bottomRight.x, y: viewSizeInfo.height }, lineOpts);
  // // hLine
  // drawLine(ctx, { x: 0, y: viewRectInfo.topLeft.y }, { x: viewSizeInfo.width, y: viewRectInfo.topLeft.y }, lineOpts);
  // drawLine(ctx, { x: 0, y: viewRectInfo.center.y }, { x: viewSizeInfo.width, y: viewRectInfo.center.y }, lineOpts);
  // drawLine(ctx, { x: 0, y: viewRectInfo.bottomRight.y }, { x: viewSizeInfo.width, y: viewRectInfo.bottomRight.y }, lineOpts);

  const boxInfo = getViewBoxInfo(viewRectInfo);
  const { width, height } = viewSizeInfo;
  // vLine
  drawLine(ctx, { x: boxInfo.minX, y: 0 }, { x: boxInfo.minX, y: height }, lineOpts);
  drawLine(ctx, { x: boxInfo.midX, y: 0 }, { x: boxInfo.midX, y: height }, lineOpts);
  drawLine(ctx, { x: boxInfo.maxX, y: 0 }, { x: boxInfo.maxX, y: height }, lineOpts);
  // hLine
  drawLine(ctx, { x: 0, y: boxInfo.minY }, { x: width, y: boxInfo.minY }, lineOpts);
  drawLine(ctx, { x: 0, y: boxInfo.midY }, { x: width, y: boxInfo.midY }, lineOpts);
  drawLine(ctx, { x: 0, y: boxInfo.maxY }, { x: width, y: boxInfo.maxY }, lineOpts);

  const crossOpts = { ...lineOpts, size: 6 };
  drawCrossByCenter(ctx, viewRectInfo.center, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.topLeft, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.topRight, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottomLeft, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottomRight, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.top, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.right, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.bottom, crossOpts);
  drawCrossByCenter(ctx, viewRectInfo.left, crossOpts);
}
