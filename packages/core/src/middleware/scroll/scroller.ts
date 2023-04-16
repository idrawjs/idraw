import type { Point, BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';

const minScrollerWidth = 12;
const scrollerAlpha = 0.12;
const scrollerThumbAlpha = 0.36;

export type ScrollbarThumbType = 'X' | 'Y';

const scrollConfig = {
  width: minScrollerWidth,
  color: '#000000',
  showBackground: true
};

function isPointAtScrollbarY(helperContext: CanvasRenderingContext2D, p: Point, sizeInfo: ViewSizeInfo): boolean {
  const { width, height } = sizeInfo;
  const ctx = helperContext;
  ctx.beginPath();
  ctx.rect(width - scrollConfig.width, 0, scrollConfig.width, height);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

function isPointAtScrollbarX(helperContext: CanvasRenderingContext2D, p: Point, sizeInfo: ViewSizeInfo): boolean {
  const { width, height } = sizeInfo;
  const ctx = helperContext;
  ctx.beginPath();
  ctx.rect(0, height - scrollConfig.width, width - scrollConfig.width, scrollConfig.width);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

export function isPointInScrollbar(helperContext: CanvasRenderingContext2D, p: Point, sizeInfo: ViewSizeInfo): ScrollbarThumbType | null {
  let thumbType: ScrollbarThumbType | null = null;
  if (isPointAtScrollbarX(helperContext, p, sizeInfo)) {
    thumbType = 'X';
  } else if (isPointAtScrollbarY(helperContext, p, sizeInfo)) {
    thumbType = 'Y';
  }
  return thumbType;
}

export function calcScrollerInfo(scaleInfo: ViewScaleInfo, sizeInfo: ViewSizeInfo) {
  const { width, height } = sizeInfo;
  const { offsetTop, offsetBottom, offsetLeft, offsetRight } = scaleInfo;
  const sliderMinSize = 10 * 2.5;
  const lineSize = 10;
  let xSize = 0;
  let ySize = 0;
  if (offsetLeft <= 0 && offsetRight <= 0) {
    xSize = Math.max(sliderMinSize, width - (Math.abs(offsetLeft) + Math.abs(offsetRight)));
    if (xSize >= width) xSize = 0;
  }
  if (offsetTop <= 0 || offsetBottom <= 0) {
    ySize = Math.max(sliderMinSize, height - (Math.abs(offsetTop) + Math.abs(offsetBottom)));
    if (ySize >= height) ySize = 0;
  }

  let translateX = 0;
  if (xSize > 0) {
    translateX = xSize / 2 + ((width - xSize) * Math.abs(offsetLeft)) / (Math.abs(offsetLeft) + Math.abs(offsetRight));
    translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
  }

  let translateY = 0;
  if (ySize > 0) {
    translateY = ySize / 2 + ((height - ySize) * Math.abs(offsetTop)) / (Math.abs(offsetTop) + Math.abs(offsetBottom));
    translateY = Math.min(Math.max(0, translateY - ySize / 2), height - ySize);
  }
  const scrollWrapper = {
    lineSize,
    xSize,
    ySize,
    translateY,
    translateX,
    color: '#0000007A'
  };
  return scrollWrapper;
}

function drawScrollerThumb(
  ctx: CanvasRenderingContext2D,
  opts: {
    axis: ScrollbarThumbType;
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    color: string;
  }
): void {
  let { x, y, h, w } = opts;
  const { color, axis } = opts;
  if (axis === 'X') {
    y = y + h / 4 + 1;
    h = h / 2;
  } else if (axis === 'Y') {
    x = x + w / 4 + 1;
    w = w / 2;
  }

  let r = opts.r;
  r = Math.min(r, w / 2, h / 2);
  if (w < r * 2 || h < r * 2) {
    r = 0;
  }
  ctx.globalAlpha = scrollerThumbAlpha;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.setLineDash([]);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

function drawScrollerInfo(helperContext: CanvasRenderingContext2D, opts: { scaleInfo: ViewScaleInfo; sizeInfo: ViewSizeInfo }) {
  const ctx = helperContext;
  const { scaleInfo, sizeInfo } = opts;
  const { width, height } = sizeInfo;
  const wrapper = calcScrollerInfo(scaleInfo, sizeInfo);
  if (wrapper.xSize > 0) {
    if (scrollConfig.showBackground === true) {
      ctx.globalAlpha = scrollerAlpha;
      ctx.fillStyle = wrapper.color;
      // x-line
      ctx.fillRect(0, height - wrapper.lineSize, width, wrapper.lineSize);
    }

    // ctx.globalAlpha = 1;
    // x-slider
    drawScrollerThumb(ctx, {
      axis: 'X',
      x: wrapper.translateX,
      y: height - wrapper.lineSize,
      w: wrapper.xSize,
      h: wrapper.lineSize,
      r: wrapper.lineSize / 2,
      color: wrapper.color
    });
  }

  if (wrapper.ySize > 0) {
    if (scrollConfig.showBackground === true) {
      ctx.globalAlpha = scrollerAlpha;
      ctx.fillStyle = wrapper.color;
      // y-line
      ctx.fillRect(width - wrapper.lineSize, 0, wrapper.lineSize, height);
    }

    // ctx.globalAlpha = 1;
    // y-slider
    drawScrollerThumb(ctx, {
      axis: 'Y',
      x: width - wrapper.lineSize,
      y: wrapper.translateY,
      w: wrapper.lineSize,
      h: wrapper.ySize,
      r: wrapper.lineSize / 2,
      color: wrapper.color
    });
  }

  ctx.globalAlpha = 1;
}

export function drawScroller(ctx: CanvasRenderingContext2D, opts: { snapshot: BoardViewerFrameSnapshot }) {
  const { snapshot } = opts;
  const sizeInfo = getViewSizeInfoFromSnapshot(snapshot);
  const scaleInfo = getViewScaleInfoFromSnapshot(snapshot);
  drawScrollerInfo(ctx, { sizeInfo, scaleInfo });
}
