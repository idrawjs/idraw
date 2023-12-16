import type {
  Element,
  ElementType,
  PointSize,
  RendererDrawElementOptions,
  ViewContext2D,
  ViewRectVertexes,
  ViewScaleInfo,
  ViewSizeInfo,
  ElementSizeController
} from '@idraw/types';
import { rotateElementVertexes, calcViewVertexes } from '@idraw/util';
import type { AreaSize } from './types';

import { resizeControllerBorderWidth, areaBorderWidth, wrapperColor, selectWrapperBorderWidth } from './config';

function drawVertexes(
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

export function drawHoverVertexesWrapper(
  ctx: ViewContext2D,
  vertexes: ViewRectVertexes | null,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  if (!vertexes) {
    return;
  }
  const wrapperOpts = { borderColor: wrapperColor, borderWidth: 1, background: 'transparent', lineDash: [] };
  drawVertexes(ctx, calcViewVertexes(vertexes, opts), wrapperOpts);
}

export function drawSelectedElementControllersVertexes(
  ctx: ViewContext2D,
  controller: ElementSizeController | null,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }
) {
  if (!controller) {
    return;
  }
  const { elementWrapper, topLeft, topRight, bottomLeft, bottomRight } = controller;
  // const wrapperColor = 'red'; // TODO
  const wrapperOpts = { borderColor: wrapperColor, borderWidth: selectWrapperBorderWidth, background: 'transparent', lineDash: [] };
  const ctrlOpts = { ...wrapperOpts, borderWidth: resizeControllerBorderWidth, background: '#FFFFFF' };

  drawVertexes(ctx, calcViewVertexes(elementWrapper, opts), wrapperOpts);
  // drawVertexes(ctx, calcViewVertexes(left.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(right.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(top.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(bottom.vertexes, opts), ctrlOpts);
  drawVertexes(ctx, calcViewVertexes(topLeft.vertexes, opts), ctrlOpts);
  drawVertexes(ctx, calcViewVertexes(topRight.vertexes, opts), ctrlOpts);
  drawVertexes(ctx, calcViewVertexes(bottomLeft.vertexes, opts), ctrlOpts);
  drawVertexes(ctx, calcViewVertexes(bottomRight.vertexes, opts), ctrlOpts);
}

export function drawElementListShadows(ctx: ViewContext2D, elements: Element<ElementType>[], opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  elements.forEach((elem) => {
    let { x, y, w, h } = elem;
    const { angle = 0 } = elem;
    if (opts?.calculator) {
      const { calculator } = opts;
      const size = calculator.elementSize({ x, y, w, h }, opts.viewScaleInfo, opts.viewSizeInfo);
      x = size.x;
      y = size.y;
      w = size.w;
      h = size.h;
    }
    const vertexes = rotateElementVertexes({ x, y, w, h, angle });
    if (vertexes.length >= 2) {
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#aaaaaa';
      ctx.fillStyle = '#0000001A';
      ctx.beginPath();
      ctx.moveTo(vertexes[0].x, vertexes[0].y);
      for (let i = 0; i < vertexes.length; i++) {
        const p = vertexes[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
  });
}

export function drawArea(ctx: ViewContext2D, opts: { start: PointSize; end: PointSize }) {
  const { start, end } = opts;
  ctx.setLineDash([]);
  ctx.lineWidth = areaBorderWidth;
  ctx.strokeStyle = wrapperColor;
  ctx.fillStyle = '#1976d24f';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.lineTo(start.x, end.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

export function drawListArea(ctx: ViewContext2D, opts: { areaSize: AreaSize }) {
  const { areaSize } = opts;
  const { x, y, w, h } = areaSize;
  ctx.setLineDash([]);
  ctx.lineWidth = areaBorderWidth;
  ctx.strokeStyle = wrapperColor;
  ctx.fillStyle = '#1976d21c';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

export function drawGroupQueueVertexesWrappers(
  ctx: ViewContext2D,
  vertexesList: ViewRectVertexes[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  for (let i = 0; i < vertexesList.length; i++) {
    const vertexes = vertexesList[i];
    const wrapperOpts = { borderColor: wrapperColor, borderWidth: selectWrapperBorderWidth, background: 'transparent', lineDash: [4, 4] };
    drawVertexes(ctx, calcViewVertexes(vertexes, opts), wrapperOpts);
  }
}
