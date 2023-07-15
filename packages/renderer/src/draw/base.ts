import { ViewContext2D, Element, ElementType, ElementSize } from '@idraw/types';
import { is, istype, isColorStr, generateSVGPath, rotateElement } from '@idraw/util';

export function drawBox(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts?: {
    originElem: Element<ElementType>;
    calcElemSize: ElementSize;
    pattern?: string | CanvasPattern | null;
    renderContent: Function;
    totalScale: number;
  }
): void {
  if (viewElem?.detail?.opacity !== undefined && viewElem?.detail?.opacity > 0) {
    ctx.globalAlpha = viewElem.detail.opacity;
  } else {
    ctx.globalAlpha = 1;
  }
  const { pattern, renderContent, originElem, calcElemSize, totalScale = 1 } = opts || {};

  drawClipPath(ctx, viewElem, {
    originElem,
    calcElemSize,
    totalScale,
    renderContent: () => {
      drawBoxBorder(ctx, viewElem);
      drawBoxBackground(ctx, viewElem, { pattern });
      renderContent?.();
    }
  });
}

function drawClipPath(
  ctx: ViewContext2D,
  viewElem: Element<ElementType>,
  opts: {
    originElem?: Element<ElementType>;
    calcElemSize?: ElementSize;
    renderContent: Function;
    totalScale: number;
  }
) {
  const { renderContent, originElem, calcElemSize, totalScale = 1 } = opts || {};
  const { clipPath } = originElem?.detail || {};
  if (clipPath && calcElemSize && clipPath.commands) {
    const { x, y, w, h } = calcElemSize;
    const { originW, originH, originX, originY } = clipPath;
    const scaleW = w / originW;
    const scaleH = h / originH;
    const viewOriginX = originX * scaleW;
    const viewOriginY = originY * scaleH;
    let internalX = x - viewOriginX;
    let internalY = y - viewOriginY;

    ctx.save();
    ctx.translate(internalX as number, internalY as number);
    ctx.scale(totalScale * scaleW, totalScale * scaleH);
    const pathStr = generateSVGPath(clipPath.commands || []);
    const path2d = new Path2D(pathStr);
    ctx.fillStyle = clipPath.fill || '#FFFFFF';
    ctx.clip(path2d);
    ctx.translate(0 - (internalX as number), 0 - (internalY as number));
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    rotateElement(ctx, { ...viewElem }, () => {
      renderContent?.();
    });

    ctx.restore();
  } else {
    renderContent?.();
  }
}

function drawBoxBackground(ctx: ViewContext2D, viewElem: Element<ElementType>, opts?: { pattern?: string | CanvasPattern | null }): void {
  const { pattern } = opts || {};

  if (viewElem.detail.bgColor || pattern) {
    const { x, y, w, h } = viewElem;
    let r: number = viewElem.detail.borderRadius || 0;
    r = Math.min(r, w / 2, h / 2);
    if (w < r * 2 || h < r * 2) {
      r = 0;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (typeof pattern === 'string') {
      ctx.fillStyle = pattern;
    } else if (['CanvasPattern'].includes(istype.type(pattern))) {
      ctx.fillStyle = pattern as CanvasPattern;
    } else if (viewElem.detail.bgColor) {
      ctx.fillStyle = viewElem.detail.bgColor;
    }
    ctx.fill();
  }
}

function drawBoxBorder(ctx: ViewContext2D, viewElem: Element<ElementType>): void {
  if (!(viewElem.detail.borderWidth && viewElem.detail.borderWidth > 0)) {
    return;
  }
  const bw = viewElem.detail.borderWidth;
  let borderColor = '#000000';
  if (isColorStr(viewElem.detail.borderColor) === true) {
    borderColor = viewElem.detail.borderColor as string;
  }
  const x = viewElem.x - bw / 2;
  const y = viewElem.y - bw / 2;
  const w = viewElem.w + bw;
  const h = viewElem.h + bw;

  let r: number = viewElem.detail.borderRadius || 0;
  r = Math.min(r, w / 2, h / 2);
  if (r < w / 2 && r < h / 2) {
    r = r + bw / 2;
  }
  const { detail } = viewElem;
  if (detail.shadowColor !== undefined && isColorStr(detail.shadowColor)) {
    ctx.shadowColor = detail.shadowColor;
  }
  if (detail.shadowOffsetX !== undefined && is.number(detail.shadowOffsetX)) {
    ctx.shadowOffsetX = detail.shadowOffsetX;
  }
  if (detail.shadowOffsetY !== undefined && is.number(detail.shadowOffsetY)) {
    ctx.shadowOffsetY = detail.shadowOffsetY;
  }
  if (detail.shadowBlur !== undefined && is.number(detail.shadowBlur)) {
    ctx.shadowBlur = detail.shadowBlur;
  }
  ctx.beginPath();
  ctx.lineWidth = bw;
  ctx.strokeStyle = borderColor;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}
