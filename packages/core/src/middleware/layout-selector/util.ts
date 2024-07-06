import type { ViewContext2D, LayoutSizeController, ViewRectVertexes, PointSize, ElementSize, MiddlewareLayoutSelectorStyle } from '@idraw/types';

function drawControllerBox(ctx: ViewContext2D, boxVertexes: ViewRectVertexes, style: MiddlewareLayoutSelectorStyle) {
  const { activeColor } = style;
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(boxVertexes[0].x, boxVertexes[0].y);
  ctx.lineTo(boxVertexes[1].x, boxVertexes[1].y);
  ctx.lineTo(boxVertexes[2].x, boxVertexes[2].y);
  ctx.lineTo(boxVertexes[3].x, boxVertexes[3].y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxVertexes[0].x, boxVertexes[0].y);
  ctx.lineTo(boxVertexes[1].x, boxVertexes[1].y);
  ctx.lineTo(boxVertexes[2].x, boxVertexes[2].y);
  ctx.lineTo(boxVertexes[3].x, boxVertexes[3].y);
  ctx.closePath();
  ctx.stroke();
}

function drawControllerLine(
  ctx: ViewContext2D,
  opts: { start: PointSize; end: PointSize; centerVertexes: ViewRectVertexes; style: MiddlewareLayoutSelectorStyle }
) {
  const { start, end, style } = opts;
  const { activeColor } = style;
  const lineWidth = 2;
  const strokeStyle = activeColor;
  ctx.setLineDash([]);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.closePath();
  ctx.stroke();
}

export function drawLayoutController(
  ctx: ViewContext2D,
  opts: {
    controller: LayoutSizeController;
    style: MiddlewareLayoutSelectorStyle;
  }
) {
  const { controller, style } = opts;
  const { topLeft, topRight, bottomLeft, bottomRight, topMiddle, rightMiddle, bottomMiddle, leftMiddle } = controller;

  drawControllerLine(ctx, { start: topLeft.center, end: topRight.center, centerVertexes: topMiddle.vertexes, style });
  drawControllerLine(ctx, { start: topRight.center, end: bottomRight.center, centerVertexes: rightMiddle.vertexes, style });
  drawControllerLine(ctx, { start: bottomRight.center, end: bottomLeft.center, centerVertexes: bottomMiddle.vertexes, style });
  drawControllerLine(ctx, { start: bottomLeft.center, end: topLeft.center, centerVertexes: leftMiddle.vertexes, style });

  drawControllerBox(ctx, topLeft.vertexes, style);
  drawControllerBox(ctx, topRight.vertexes, style);
  drawControllerBox(ctx, bottomRight.vertexes, style);
  drawControllerBox(ctx, bottomLeft.vertexes, style);
}

export function drawLayoutHover(
  ctx: ViewContext2D,
  opts: {
    layoutSize: ElementSize;
    style: MiddlewareLayoutSelectorStyle;
  }
) {
  const { layoutSize, style } = opts;
  const { activeColor } = style;
  const { x, y, w, h } = layoutSize;
  ctx.setLineDash([]);
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
}
