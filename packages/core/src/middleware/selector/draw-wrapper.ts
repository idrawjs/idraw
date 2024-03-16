import type {
  Element,
  ElementType,
  PointSize,
  RendererDrawElementOptions,
  ViewContext2D,
  ViewRectVertexes,
  ViewScaleInfo,
  ViewSizeInfo,
  ElementSizeController,
  ViewCalculator
} from '@idraw/types';
import { rotateElementVertexes, calcViewPointSize, calcViewVertexes, calcViewElementSize } from '@idraw/util';
import type { AreaSize } from './types';
import { resizeControllerBorderWidth, areaBorderWidth, wrapperColor, selectWrapperBorderWidth, lockColor, controllerSize } from './config';
import { drawVertexes, drawLine, drawCircleController, drawCrossVertexes } from './draw-base';
// import { drawAuxiliaryExperimentBox } from './draw-auxiliary';

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

export function drawLockVertexesWrapper(
  ctx: ViewContext2D,
  vertexes: ViewRectVertexes | null,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    controller?: ElementSizeController | null;
  }
) {
  if (!vertexes) {
    return;
  }
  const wrapperOpts = { borderColor: lockColor, borderWidth: 1, background: 'transparent', lineDash: [] };
  drawVertexes(ctx, calcViewVertexes(vertexes, opts), wrapperOpts);

  const { controller } = opts;
  if (controller) {
    const { topLeft, topRight, bottomLeft, bottomRight, topMiddle, bottomMiddle, leftMiddle, rightMiddle } = controller;
    const ctrlOpts = { ...wrapperOpts, borderWidth: 1, background: lockColor };

    drawCrossVertexes(ctx, calcViewVertexes(topMiddle.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(bottomMiddle.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(leftMiddle.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(rightMiddle.vertexes, opts), ctrlOpts);

    drawCrossVertexes(ctx, calcViewVertexes(topLeft.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(topRight.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(bottomLeft.vertexes, opts), ctrlOpts);
    drawCrossVertexes(ctx, calcViewVertexes(bottomRight.vertexes, opts), ctrlOpts);
  }
}

export function drawSelectedElementControllersVertexes(
  ctx: ViewContext2D,
  controller: ElementSizeController | null,
  opts: {
    hideControllers: boolean;
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    element: Element | null;
    calculator: ViewCalculator;
  }
) {
  if (!controller) {
    return;
  }
  const {
    hideControllers
    // calculator, element, viewScaleInfo, viewSizeInfo
  } = opts;
  const { elementWrapper, topLeft, topRight, bottomLeft, bottomRight, top, rotate } = controller;
  const wrapperOpts = { borderColor: wrapperColor, borderWidth: selectWrapperBorderWidth, background: 'transparent', lineDash: [] };
  const ctrlOpts = { ...wrapperOpts, borderWidth: resizeControllerBorderWidth, background: '#FFFFFF' };

  drawVertexes(ctx, calcViewVertexes(elementWrapper, opts), wrapperOpts);
  // drawVertexes(ctx, calcViewVertexes(left.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(right.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(top.vertexes, opts), ctrlOpts);
  // drawVertexes(ctx, calcViewVertexes(bottom.vertexes, opts), ctrlOpts);
  if (!hideControllers) {
    drawLine(ctx, calcViewPointSize(top.center, opts), calcViewPointSize(rotate.center, opts), { ...ctrlOpts, borderWidth: 2 });
    drawVertexes(ctx, calcViewVertexes(topLeft.vertexes, opts), ctrlOpts);
    drawVertexes(ctx, calcViewVertexes(topRight.vertexes, opts), ctrlOpts);
    drawVertexes(ctx, calcViewVertexes(bottomLeft.vertexes, opts), ctrlOpts);
    drawVertexes(ctx, calcViewVertexes(bottomRight.vertexes, opts), ctrlOpts);
    drawCircleController(ctx, calcViewPointSize(rotate.center, opts), { ...ctrlOpts, size: controllerSize, borderWidth: 2 });
  }

  // drawAuxiliaryExperimentBox(ctx, {
  //   calculator,
  //   element,
  //   viewScaleInfo,
  //   viewSizeInfo
  // });
}

export function drawElementListShadows(ctx: ViewContext2D, elements: Element<ElementType>[], opts?: Omit<RendererDrawElementOptions, 'loader'>) {
  elements.forEach((elem) => {
    let { x, y, w, h } = elem;
    const { angle = 0 } = elem;
    if (opts?.calculator) {
      const size = calcViewElementSize({ x, y, w, h }, opts);
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
