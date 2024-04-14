import type { ViewContext2D, LayoutSizeController, DataLayout, ViewRectVertexes, PointSize } from '@idraw/types';
import { selectColor, disableColor } from './config';

function drawControllerBox(ctx: ViewContext2D, boxVertexes: ViewRectVertexes) {
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(boxVertexes[0].x, boxVertexes[0].y);
  ctx.lineTo(boxVertexes[1].x, boxVertexes[1].y);
  ctx.lineTo(boxVertexes[2].x, boxVertexes[2].y);
  ctx.lineTo(boxVertexes[3].x, boxVertexes[3].y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = selectColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxVertexes[0].x, boxVertexes[0].y);
  ctx.lineTo(boxVertexes[1].x, boxVertexes[1].y);
  ctx.lineTo(boxVertexes[2].x, boxVertexes[2].y);
  ctx.lineTo(boxVertexes[3].x, boxVertexes[3].y);
  ctx.closePath();
  ctx.stroke();
}

function drawControllerCross(ctx: ViewContext2D, opts: { vertexes: ViewRectVertexes; strokeStyle: string; lineWidth: number }) {
  const { vertexes, strokeStyle, lineWidth } = opts;

  ctx.setLineDash([]);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(vertexes[0].x, vertexes[0].y);
  ctx.lineTo(vertexes[2].x, vertexes[2].y);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(vertexes[1].x, vertexes[1].y);
  ctx.lineTo(vertexes[3].x, vertexes[3].y);
  ctx.closePath();
  ctx.stroke();
}

function drawControllerLine(ctx: ViewContext2D, opts: { start: PointSize; end: PointSize; centerVertexes: ViewRectVertexes; disabled: boolean }) {
  const { start, end, centerVertexes, disabled } = opts;
  const lineWidth = disabled === true ? 1 : 2;
  const strokeStyle = disabled === true ? disableColor : selectColor;
  ctx.setLineDash([]);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.closePath();
  ctx.stroke();

  if (disabled === true) {
    drawControllerCross(ctx, {
      vertexes: centerVertexes,
      lineWidth,
      strokeStyle
    });
  }
}

export function drawLayoutController(
  ctx: ViewContext2D,
  opts: {
    controller: LayoutSizeController;
    operations: DataLayout['operations'];
  }
) {
  // TODO
  const { controller, operations } = opts;
  const { topLeft, topRight, bottomLeft, bottomRight, topMiddle, rightMiddle, bottomMiddle, leftMiddle } = controller;

  drawControllerLine(ctx, { start: topLeft.center, end: topRight.center, centerVertexes: topMiddle.vertexes, disabled: !!operations?.disabledTop });
  drawControllerLine(ctx, { start: topRight.center, end: bottomRight.center, centerVertexes: rightMiddle.vertexes, disabled: !!operations?.disabledRight });
  drawControllerLine(ctx, { start: bottomRight.center, end: bottomLeft.center, centerVertexes: bottomMiddle.vertexes, disabled: !!operations?.disabledBottom });
  drawControllerLine(ctx, { start: bottomLeft.center, end: topLeft.center, centerVertexes: leftMiddle.vertexes, disabled: !!operations?.disabledLeft });

  const disabledOpts = {
    lineWidth: 1,
    strokeStyle: disableColor
  };
  if (operations?.disabledTopLeft === true) {
    drawControllerCross(ctx, { vertexes: topLeft.vertexes, ...disabledOpts });
  } else {
    drawControllerBox(ctx, topLeft.vertexes);
  }

  if (operations?.disabledTopRight === true) {
    drawControllerCross(ctx, { vertexes: topRight.vertexes, ...disabledOpts });
  } else {
    drawControllerBox(ctx, topRight.vertexes);
  }

  if (operations?.disabledBottomRight === true) {
    drawControllerCross(ctx, { vertexes: bottomRight.vertexes, ...disabledOpts });
  } else {
    drawControllerBox(ctx, bottomRight.vertexes);
  }

  if (operations?.disabledBottomLeft === true) {
    drawControllerCross(ctx, { vertexes: bottomLeft.vertexes, ...disabledOpts });
  } else {
    drawControllerBox(ctx, bottomLeft.vertexes);
  }
}
