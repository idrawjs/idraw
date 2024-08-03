import type { ViewRectVertexes, ElementSizeController, ViewContext2D, ViewSizeInfo, ViewScaleInfo } from '@idraw/types';
import { calcViewPointSize } from '@idraw/util';

function drawDebugControllerVertexes(opts: {
  ctx: ViewContext2D;
  vertexes: ViewRectVertexes;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): boolean {
  const { ctx, viewScaleInfo, vertexes } = opts;
  const v0 = calcViewPointSize(vertexes[0], { viewScaleInfo });
  const v1 = calcViewPointSize(vertexes[1], { viewScaleInfo });
  const v2 = calcViewPointSize(vertexes[2], { viewScaleInfo });
  const v3 = calcViewPointSize(vertexes[3], { viewScaleInfo });

  ctx.beginPath();

  ctx.fillStyle = '#FF0000A1';
  ctx.moveTo(v0.x, v0.y);
  ctx.lineTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);
  ctx.lineTo(v0.x, v0.y);
  ctx.closePath();
  ctx.fill();

  return false;
}

export function drawDebugStoreSelectedElementController(
  ctx: ViewContext2D,
  controller: ElementSizeController | null,
  opts: {
    viewSizeInfo: ViewSizeInfo;
    viewScaleInfo: ViewScaleInfo;
  }
) {
  if (!controller) {
    return;
  }
  const { viewSizeInfo, viewScaleInfo } = opts;
  const { left, right, top, bottom, topLeft, topRight, bottomLeft, bottomRight, rotate } = controller;

  const ctrls = [left, right, top, bottom, topLeft, topRight, bottomLeft, bottomRight, rotate];
  for (let i = 0; i < ctrls.length; i++) {
    const ctrl = ctrls[i];
    drawDebugControllerVertexes({ ctx, vertexes: ctrl.vertexes, viewSizeInfo, viewScaleInfo });
  }
}
