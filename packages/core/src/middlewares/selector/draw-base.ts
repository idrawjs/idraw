import type { Point, ViewContext2D, ViewRectVertexes } from '@idraw/types';

export function drawVertexes(
  ctx: ViewContext2D,
  vertexes: ViewRectVertexes,
  opts: { stroke: string; strokeWidth: number; background: string; lineDash: number[] }
) {
  const { stroke, strokeWidth, background, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = background;
  ctx.setLineDash(lineDash);
  ctx.beginPath();
  ctx.moveTo(vertexes[0].x, vertexes[0].y);
  ctx.lineTo(vertexes[1].x, vertexes[1].y);
  ctx.lineTo(vertexes[2].x, vertexes[2].y);
  ctx.lineTo(vertexes[3].x, vertexes[3].y);
  ctx.lineTo(vertexes[0].x, vertexes[0].y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill('nonzero');
}

export function drawLine(
  ctx: ViewContext2D,
  start: Point,
  end: Point,
  opts: { stroke: string; strokeWidth: number; lineDash: number[] }
) {
  const { stroke, strokeWidth, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  ctx.setLineDash(lineDash);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.closePath();
  ctx.stroke();
}

function drawCrossVertexes(
  ctx: ViewContext2D,
  vertexes: ViewRectVertexes,
  opts: { stroke: string; strokeWidth: number; lineDash: number[] }
) {
  const { stroke, strokeWidth, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = stroke;
  // ctx.fillStyle = background;
  ctx.setLineDash(lineDash);
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

export function drawCrossByCenter(
  ctx: ViewContext2D,
  center: Point,
  opts: { size: number; stroke: string; strokeWidth: number; lineDash: number[] }
) {
  const { size, stroke, strokeWidth, lineDash } = opts;
  const minX = center.x - size / 2;
  const maxX = center.x + size / 2;
  const minY = center.y - size / 2;
  const maxY = center.y + size / 2;
  const vertexes: ViewRectVertexes = [
    {
      x: minX,
      y: minY,
    },
    {
      x: maxX,
      y: minY,
    },
    {
      x: maxX,
      y: maxY,
    },
    {
      x: minX,
      y: maxY,
    },
  ];
  drawCrossVertexes(ctx, vertexes, {
    stroke,
    strokeWidth,
    lineDash,
  });
}
