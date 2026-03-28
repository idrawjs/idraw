import type {
  ViewContext2D,
  LayoutSizeController,
  ViewRectVertexes,
  Point,
  MaterialSize,
  MiddlewareLayoutSelectorStyles,
} from '@idraw/types';

function drawControllerBox(ctx: ViewContext2D, boxVertexes: ViewRectVertexes, styles: MiddlewareLayoutSelectorStyles) {
  const { activeColor } = styles;
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(boxVertexes[0].x, boxVertexes[0].y);
  ctx.lineTo(boxVertexes[1].x, boxVertexes[1].y);
  ctx.lineTo(boxVertexes[2].x, boxVertexes[2].y);
  ctx.lineTo(boxVertexes[3].x, boxVertexes[3].y);
  ctx.closePath();
  ctx.fill('nonzero');

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
  opts: { start: Point; end: Point; centerVertexes: ViewRectVertexes; styles: MiddlewareLayoutSelectorStyles }
) {
  const { start, end, styles } = opts;
  const { activeColor } = styles;
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
    styles: MiddlewareLayoutSelectorStyles;
  }
) {
  const { controller, styles } = opts;
  const { topLeft, topRight, bottomLeft, bottomRight, topMiddle, rightMiddle, bottomMiddle, leftMiddle } = controller;

  drawControllerLine(ctx, { start: topLeft.center, end: topRight.center, centerVertexes: topMiddle.vertexes, styles });
  drawControllerLine(ctx, {
    start: topRight.center,
    end: bottomRight.center,
    centerVertexes: rightMiddle.vertexes,
    styles,
  });
  drawControllerLine(ctx, {
    start: bottomRight.center,
    end: bottomLeft.center,
    centerVertexes: bottomMiddle.vertexes,
    styles,
  });
  drawControllerLine(ctx, {
    start: bottomLeft.center,
    end: topLeft.center,
    centerVertexes: leftMiddle.vertexes,
    styles,
  });

  drawControllerBox(ctx, topLeft.vertexes, styles);
  drawControllerBox(ctx, topRight.vertexes, styles);
  drawControllerBox(ctx, bottomRight.vertexes, styles);
  drawControllerBox(ctx, bottomLeft.vertexes, styles);
}

export function drawLayoutHover(
  ctx: ViewContext2D,
  opts: {
    layoutSize: MaterialSize;
    styles: MiddlewareLayoutSelectorStyles;
  }
) {
  const { layoutSize, styles } = opts;
  const { activeColor } = styles;
  const { x, y, width, height } = layoutSize;
  ctx.setLineDash([]);
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
}
