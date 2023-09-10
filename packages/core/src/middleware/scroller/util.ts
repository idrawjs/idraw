import type { Point, BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo, ViewContext2D, ElementSize } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';

const minScrollerWidth = 12;
const scrollerLineWidth = 16;
const scrollerAlpha = 0.12;
const scrollerThumbAlpha = 0.36;

export type ScrollbarThumbType = 'X' | 'Y';

const scrollConfig = {
  width: minScrollerWidth,
  color: '#000000',
  showBackground: true
};

function isPointAtScrollbarY(helperContext: ViewContext2D, p: Point, viewSizeInfo: ViewSizeInfo): boolean {
  const { width, height } = viewSizeInfo;
  const ctx = helperContext;
  ctx.beginPath();
  ctx.rect(width - scrollConfig.width, 0, scrollConfig.width, height);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

function isPointAtScrollbarX(helperContext: ViewContext2D, p: Point, viewSizeInfo: ViewSizeInfo): boolean {
  const { width, height } = viewSizeInfo;
  const ctx = helperContext;
  ctx.beginPath();
  ctx.rect(0, height - scrollConfig.width, width - scrollConfig.width, scrollConfig.width);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

export function isPointInScrollbar(helperContext: ViewContext2D, p: Point, viewSizeInfo: ViewSizeInfo): ScrollbarThumbType | null {
  let thumbType: ScrollbarThumbType | null = null;
  if (isPointAtScrollbarX(helperContext, p, viewSizeInfo)) {
    thumbType = 'X';
  } else if (isPointAtScrollbarY(helperContext, p, viewSizeInfo)) {
    thumbType = 'Y';
  }
  return thumbType;
}

function isPointAtRect(helperContext: ViewContext2D, p: Point, rect: ElementSize): boolean {
  const ctx = helperContext;
  const { x, y, w, h } = rect;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  if (ctx.isPointInPath(p.x, p.y)) {
    return true;
  }
  return false;
}

export function isPointInScrollThumb(
  helperContext: ViewContext2D,
  p: Point,
  opts: {
    xThumbRect?: ElementSize | null;
    yThumbRect?: ElementSize | null;
  }
): ScrollbarThumbType | null {
  let thumbType: ScrollbarThumbType | null = null;
  const { xThumbRect, yThumbRect } = opts;
  if (xThumbRect && isPointAtRect(helperContext, p, xThumbRect)) {
    thumbType = 'X';
  } else if (yThumbRect && isPointAtRect(helperContext, p, yThumbRect)) {
    thumbType = 'Y';
  }
  return thumbType;
}

function calcScrollerInfo(viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo) {
  const { width, height } = viewSizeInfo;
  const { offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const sliderMinSize = scrollerLineWidth * 2.5;
  const lineSize = scrollerLineWidth;

  let xSize = 0;
  let ySize = 0;
  xSize = Math.max(sliderMinSize, width - (Math.abs(offsetLeft) + Math.abs(offsetRight)));
  if (xSize >= width) {
    xSize = width;
  }
  ySize = Math.max(sliderMinSize, height - (Math.abs(offsetTop) + Math.abs(offsetBottom)));
  if (ySize >= height) {
    ySize = width;
  }

  const xStart = lineSize / 2;
  const xEnd = width - xSize - lineSize;
  let translateX = xStart;

  if (offsetLeft > 0) {
    translateX = xStart;
  } else if (offsetRight > 0) {
    translateX = xEnd;
  } else if (offsetLeft <= 0 && xSize > 0 && !(offsetLeft === 0 && offsetRight === 0)) {
    translateX = xSize / 2 + ((width - xSize) * Math.abs(offsetLeft)) / (Math.abs(offsetLeft) + Math.abs(offsetRight));
    translateX = Math.min(Math.max(0, translateX - xSize / 2), width - xSize);
  }

  const yStart = lineSize / 2;
  const yEnd = width - xSize - lineSize;
  let translateY = yStart;
  if (offsetTop > 0) {
    translateY = yStart;
  } else if (offsetBottom > 0) {
    translateY = yEnd;
  } else if (offsetTop <= 0 && ySize > 0 && !(offsetTop === 0 && offsetBottom === 0)) {
    translateY = ySize / 2 + ((height - ySize) * Math.abs(offsetTop)) / (Math.abs(offsetTop) + Math.abs(offsetBottom));
    translateY = Math.min(Math.max(0, translateY - ySize / 2), height - ySize);
  }
  const xThumbRect: ElementSize = {
    x: translateX,
    y: height - lineSize,
    w: xSize,
    h: lineSize
  };
  const yThumbRect: ElementSize = {
    x: width - lineSize,
    y: translateY,
    w: lineSize,
    h: ySize
  };
  const scrollWrapper = {
    lineSize,
    xSize,
    ySize,
    translateY,
    translateX,
    color: '#0000007A',
    xThumbRect,
    yThumbRect
  };
  return scrollWrapper;
}

function drawScrollerThumb(
  ctx: ViewContext2D,
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
    y = y + h / 4 + 0;
    h = h / 2;
  } else if (axis === 'Y') {
    x = x + w / 4 + 0;
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

function drawScrollerInfo(helperContext: ViewContext2D, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }) {
  const ctx = helperContext;
  const { viewScaleInfo, viewSizeInfo } = opts;
  const { width, height } = viewSizeInfo;
  const wrapper = calcScrollerInfo(viewScaleInfo, viewSizeInfo);
  const { xThumbRect, yThumbRect } = wrapper;
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
      ...xThumbRect,
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
      ...yThumbRect,
      r: wrapper.lineSize / 2,
      color: wrapper.color
    });
  }

  ctx.globalAlpha = 1;
  return {
    xThumbRect,
    yThumbRect
  };
}

export function drawScroller(ctx: ViewContext2D, opts: { snapshot: BoardViewerFrameSnapshot }) {
  const { snapshot } = opts;
  const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);
  const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
  const { xThumbRect, yThumbRect } = drawScrollerInfo(ctx, { viewSizeInfo, viewScaleInfo });
  return { xThumbRect, yThumbRect };
}
