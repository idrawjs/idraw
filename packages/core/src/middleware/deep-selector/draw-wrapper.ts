import type {
  Element,
  ElementSize,
  ElementType,
  PointSize,
  RendererDrawElementOptions,
  ViewContext2D,
  ViewRectVertexes,
  ViewScaleInfo,
  ViewSizeInfo
} from '@idraw/types';
import { rotateElement, rotateElementVertexes, calcViewPointSize, calcElementQueueVertexesQueueInGroup, calcElementVertexesInGroup } from '@idraw/util';
// import { calcElementControllerStyle } from './controller';
import type { AreaSize, ControllerStyle, ElementSizeController } from './types';

const wrapperColor = '#1973ba';

export function drawPointWrapper(ctx: ViewContext2D, elem: ElementSize) {
  const bw = 0;
  const { x, y, w, h } = elem;
  const { angle = 0 } = elem;

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = wrapperColor;

    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();
  });
}

export function drawHoverWrapper(ctx: ViewContext2D, elem: ElementSize) {
  const bw = 0;
  const { x, y, w, h } = elem;
  const { angle = 0 } = elem;
  rotateElement(ctx, { x, y, w, h, angle }, () => {
    // ctx.setLineDash([4, 4]);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = wrapperColor;
    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();
  });
}

function drawController(ctx: ViewContext2D, style: ControllerStyle) {
  const { x, y, w, h, borderColor, borderWidth, bgColor } = style;

  ctx.setLineDash([]);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

export function drawElementControllers(
  ctx: ViewContext2D,
  elem: ElementSize,
  opts: Omit<RendererDrawElementOptions, 'loader' | 'parentElementSize'> & { sizeControllers: ElementSizeController }
) {
  const bw = 0;
  const { x, y, w, h } = elem;
  const { angle = 0 } = elem;
  const { sizeControllers } = opts;

  rotateElement(ctx, { x, y, w, h, angle }, () => {
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = wrapperColor;

    ctx.beginPath();
    ctx.moveTo(x - bw, y - bw);
    ctx.lineTo(x + w + bw, y - bw);
    ctx.lineTo(x + w + bw, y + h + bw);
    ctx.lineTo(x - bw, y + h + bw);
    ctx.lineTo(x - bw, y - bw);
    ctx.closePath();
    ctx.stroke();

    Object.keys(sizeControllers).forEach((name: string) => {
      const ctrl = sizeControllers[name];
      drawController(ctx, { ...ctrl, ...{} });
    });
  });
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
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1976d2';
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
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1976d2';
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

export function drawGroupsWrapper(
  ctx: ViewContext2D,
  groupQueue: Element<'group'>[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  const vesList: ViewRectVertexes[] = calcElementQueueVertexesQueueInGroup(groupQueue);

  for (let i = 0; i < vesList.length; i++) {
    const ves = vesList[i];
    const v0 = calcViewPointSize(ves[0], opts);
    const v1 = calcViewPointSize(ves[1], opts);
    const v2 = calcViewPointSize(ves[2], opts);
    const v3 = calcViewPointSize(ves[3], opts);

    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = wrapperColor;
    ctx.beginPath();
    ctx.moveTo(v0.x, v0.y);
    ctx.lineTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineTo(v3.x, v3.y);
    ctx.lineTo(v0.x, v0.y);
    ctx.closePath();
    ctx.stroke();
  }
}

export function drawHoverWrapperInGroup(
  ctx: ViewContext2D,
  elem: ElementSize,
  groupQueue: Element<'group'>[],
  opts: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
  }
) {
  const ves = calcElementVertexesInGroup(elem, { groupQueue });
  if (ves) {
    const v0 = calcViewPointSize(ves[0], opts);
    const v1 = calcViewPointSize(ves[1], opts);
    const v2 = calcViewPointSize(ves[2], opts);
    const v3 = calcViewPointSize(ves[3], opts);

    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = wrapperColor;
    ctx.beginPath();
    ctx.moveTo(v0.x, v0.y);
    ctx.lineTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineTo(v3.x, v3.y);
    ctx.lineTo(v0.x, v0.y);
    ctx.closePath();
    ctx.stroke();
  }
}
