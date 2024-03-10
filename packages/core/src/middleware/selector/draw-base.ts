import type { PointSize, ViewContext2D, ViewRectVertexes } from '@idraw/types';

export function drawVertexes(
  ctx: ViewContext2D,
  vertexes: ViewRectVertexes,
  opts: { borderColor: string; borderWidth: number; background: string; lineDash: number[] }
) {
  const { borderColor, borderWidth, background, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
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
  ctx.fill();
}

export function drawLine(ctx: ViewContext2D, start: PointSize, end: PointSize, opts: { borderColor: string; borderWidth: number; lineDash: number[] }) {
  const { borderColor, borderWidth, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.setLineDash(lineDash);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.closePath();
  ctx.stroke();
}

export function drawCircleController(
  ctx: ViewContext2D,
  circleCenter: PointSize,
  opts: { borderColor: string; borderWidth: number; background: string; lineDash: number[]; size: number }
) {
  const { size, borderColor, borderWidth, background } = opts;
  const center = circleCenter;
  const r = size / 2;

  const a = r;
  const b = r;
  // 'content-box'

  if (a >= 0 && b >= 0) {
    // draw border
    if (typeof borderWidth === 'number' && borderWidth > 0) {
      const ba = borderWidth / 2 + a;
      const bb = borderWidth / 2 + b;
      ctx.beginPath();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.circle(center.x, center.y, ba, bb, 0, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
    }

    // draw content
    ctx.beginPath();
    ctx.fillStyle = background;
    ctx.circle(center.x, center.y, a, b, 0, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // ctx.setLineDash([]);
  // ctx.lineWidth = borderWidth;
  // ctx.strokeStyle = borderColor;
  // ctx.fillStyle = background;
  // ctx.setLineDash(lineDash);
  // ctx.beginPath();
  // ctx.moveTo(vertexes[0].x, vertexes[0].y);
  // ctx.lineTo(vertexes[1].x, vertexes[1].y);
  // ctx.lineTo(vertexes[2].x, vertexes[2].y);
  // ctx.lineTo(vertexes[3].x, vertexes[3].y);
  // ctx.lineTo(vertexes[0].x, vertexes[0].y);
  // ctx.closePath();
  // ctx.stroke();
  // ctx.fill();
}

export function drawCrossVertexes(ctx: ViewContext2D, vertexes: ViewRectVertexes, opts: { borderColor: string; borderWidth: number; lineDash: number[] }) {
  const { borderColor, borderWidth, lineDash } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
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

export function drawCrossByCenter(ctx: ViewContext2D, center: PointSize, opts: { size: number; borderColor: string; borderWidth: number; lineDash: number[] }) {
  const { size, borderColor, borderWidth, lineDash } = opts;
  const minX = center.x - size / 2;
  const maxX = center.x + size / 2;
  const minY = center.y - size / 2;
  const maxY = center.y + size / 2;
  const vertexes: ViewRectVertexes = [
    {
      x: minX,
      y: minY
    },
    {
      x: maxX,
      y: minY
    },
    {
      x: maxX,
      y: maxY
    },
    {
      x: minX,
      y: maxY
    }
  ];
  drawCrossVertexes(ctx, vertexes, {
    borderColor,
    borderWidth,
    lineDash
  });
}
