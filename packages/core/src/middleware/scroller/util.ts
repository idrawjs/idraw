import type { Point, BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo, ViewContext2D, ElementSize } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import { keyActivePoint, keyActiveThumbType, keyPrevPoint, keyXThumbRect, keyYThumbRect } from './config';

const minScrollerWidth = 12;
const scrollerLineWidth = 16;
const scrollerThumbAlpha = 0.3;

export type ScrollbarThumbType = 'X' | 'Y';

const scrollConfig = {
  width: minScrollerWidth,
  thumbColor: '#000000AA',
  scrollBarColor: '#FFFFFF60',
  showScrollBar: false
};

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

interface ScrollInfo {
  activePoint: Point | null;
  prevPoint: Point | null;
  activeThumbType: ScrollbarThumbType | null;
  xThumbRect: ElementSize | null;
  yThumbRect: ElementSize | null;
}
function getScrollInfoFromSnapshot(snapshot: BoardViewerFrameSnapshot): ScrollInfo {
  const { sharedStore } = snapshot;
  const info: ScrollInfo = {
    activePoint: sharedStore[keyActivePoint] || null,
    prevPoint: sharedStore[keyPrevPoint] || null,
    activeThumbType: sharedStore[keyActiveThumbType] || null,
    xThumbRect: sharedStore[keyXThumbRect] || null,
    yThumbRect: sharedStore[keyYThumbRect] || null
  };
  return info;
}

function calcScrollerInfo(viewScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo) {
  const { width, height } = viewSizeInfo;
  const { offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const sliderMinSize = scrollerLineWidth * 2.5;
  const lineSize = scrollerLineWidth;

  let xSize = 0;
  let ySize = 0;
  xSize = Math.max(sliderMinSize, width - lineSize * 2 - (Math.abs(offsetLeft) + Math.abs(offsetRight)));
  if (xSize >= width) {
    xSize = width;
  }
  ySize = Math.max(sliderMinSize, height - lineSize * 2 - (Math.abs(offsetTop) + Math.abs(offsetBottom)));
  if (ySize >= height) {
    ySize = height;
  }

  // const xStart = lineSize / 2;
  const xStart = lineSize;
  const xEnd = width - xSize - lineSize;
  let translateX = xStart;

  if (offsetLeft > 0) {
    translateX = xStart;
  } else if (offsetRight > 0) {
    translateX = xEnd;
  } else if (offsetLeft <= 0 && xSize > 0 && !(offsetLeft === 0 && offsetRight === 0)) {
    translateX = xStart + ((width - xSize) * Math.abs(offsetLeft)) / (Math.abs(offsetLeft) + Math.abs(offsetRight));
    translateX = Math.min(Math.max(0, translateX - xStart), width - xSize);
  }

  // const yStart = lineSize / 2;
  const yStart = lineSize;
  const yEnd = height - ySize - lineSize;
  let translateY = yStart;
  if (offsetTop > 0) {
    translateY = yStart;
  } else if (offsetBottom > 0) {
    translateY = yEnd;
  } else if (offsetTop <= 0 && ySize > 0 && !(offsetTop === 0 && offsetBottom === 0)) {
    translateY = yStart + ((height - ySize) * Math.abs(offsetTop)) / (Math.abs(offsetTop) + Math.abs(offsetBottom));
    translateY = Math.min(Math.max(0, translateY - yStart), height - ySize);
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
    thumbColor: scrollConfig.thumbColor,
    scrollBarColor: scrollConfig.scrollBarColor,
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

  ctx.save();
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 1;
  {
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
  ctx.restore();
}

function drawScrollerInfo(helperContext: ViewContext2D, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; scrollInfo: ScrollInfo }) {
  const ctx = helperContext;
  const { viewScaleInfo, viewSizeInfo, scrollInfo } = opts;
  const { activeThumbType, prevPoint, activePoint } = scrollInfo;
  const { width, height } = viewSizeInfo;
  const wrapper = calcScrollerInfo(viewScaleInfo, viewSizeInfo);
  let xThumbRect: ElementSize = { ...wrapper.xThumbRect };
  let yThumbRect: ElementSize = { ...wrapper.yThumbRect };

  if (activeThumbType && prevPoint && activePoint) {
    if (activeThumbType === 'X' && scrollInfo.xThumbRect) {
      xThumbRect = { ...scrollInfo.xThumbRect };
      xThumbRect.x = xThumbRect.x + (activePoint.x - prevPoint.x);
    } else if (activeThumbType === 'Y' && scrollInfo.yThumbRect) {
      yThumbRect = { ...scrollInfo.yThumbRect };
      yThumbRect.y = yThumbRect.y + (activePoint.y - prevPoint.y);
    }
  }

  // x-bar
  if (scrollConfig.showScrollBar === true) {
    ctx.fillStyle = wrapper.scrollBarColor;
    // x-line
    ctx.fillRect(0, height - wrapper.lineSize, width, wrapper.lineSize);
  }

  // x-thumb
  drawScrollerThumb(ctx, {
    axis: 'X',
    ...xThumbRect,
    r: wrapper.lineSize / 2,
    color: wrapper.thumbColor
  });

  // y-bar
  if (scrollConfig.showScrollBar === true) {
    ctx.fillStyle = wrapper.scrollBarColor;
    // y-line
    ctx.fillRect(width - wrapper.lineSize, 0, wrapper.lineSize, height);
  }

  // y-thumb
  drawScrollerThumb(ctx, {
    axis: 'Y',
    ...yThumbRect,
    r: wrapper.lineSize / 2,
    color: wrapper.thumbColor
  });

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
  const scrollInfo = getScrollInfoFromSnapshot(snapshot);
  const { xThumbRect, yThumbRect } = drawScrollerInfo(ctx, { viewSizeInfo, viewScaleInfo, scrollInfo });
  return { xThumbRect, yThumbRect };
}
