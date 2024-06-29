import type { Point, BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo, ViewContext2D, ElementSize, MiddlewareScrollerStyle } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import { keyActivePoint, keyActiveThumbType, keyPrevPoint, keyXThumbRect, keyYThumbRect, keyHoverXThumbRect, keyHoverYThumbRect } from './config';

const scrollerLineWidth = 16;
const minThumbLength = scrollerLineWidth * 2.5;

export type ScrollbarThumbType = 'X' | 'Y';

function isPointAtRect(overlayContext: ViewContext2D, p: Point, rect: ElementSize): boolean {
  const ctx = overlayContext;
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
  overlayContext: ViewContext2D,
  p: Point,
  opts: {
    xThumbRect?: ElementSize | null;
    yThumbRect?: ElementSize | null;
  }
): ScrollbarThumbType | null {
  let thumbType: ScrollbarThumbType | null = null;
  const { xThumbRect, yThumbRect } = opts;
  if (xThumbRect && isPointAtRect(overlayContext, p, xThumbRect)) {
    thumbType = 'X';
  } else if (yThumbRect && isPointAtRect(overlayContext, p, yThumbRect)) {
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
  hoverXThumb: boolean | null;
  hoverYThumb: boolean | null;
}
function getScrollInfoFromSnapshot(snapshot: BoardViewerFrameSnapshot): ScrollInfo {
  const { sharedStore } = snapshot;
  const info: ScrollInfo = {
    activePoint: sharedStore[keyActivePoint] || null,
    prevPoint: sharedStore[keyPrevPoint] || null,
    activeThumbType: sharedStore[keyActiveThumbType] || null,
    xThumbRect: sharedStore[keyXThumbRect] || null,
    yThumbRect: sharedStore[keyYThumbRect] || null,
    hoverXThumb: sharedStore[keyHoverXThumbRect],
    hoverYThumb: sharedStore[keyHoverYThumbRect]
  };
  return info;
}

function calcScrollerInfo(opts: {
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
  hoverXThumb: boolean | null;
  hoverYThumb: boolean | null;
  style: MiddlewareScrollerStyle;
}) {
  const { viewScaleInfo, viewSizeInfo, hoverXThumb, hoverYThumb, style } = opts;
  const { width, height } = viewSizeInfo;
  const { offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const sliderMinSize = minThumbLength;
  const lineSize = scrollerLineWidth;
  const { thumbBackground, thumbBorderColor, hoverThumbBackground, hoverThumbBorderColor } = style;

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
    xThumbBackground: hoverXThumb ? hoverThumbBackground : thumbBackground,
    yThumbBackground: hoverYThumb ? hoverThumbBackground : thumbBackground,
    xThumbBorderColor: hoverXThumb ? hoverThumbBorderColor : thumbBorderColor,
    yThumbBorderColor: hoverYThumb ? hoverThumbBorderColor : thumbBorderColor,
    // scrollBarColor: scrollConfig.scrollBarColor,
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
    background: string;
    borderColor: string;
  }
): void {
  let { x, y, h, w, background, borderColor } = opts;

  ctx.save();
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 1;
  {
    const { axis } = opts;
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
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = background;
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = borderColor;
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

function drawScrollerInfo(
  overlayContext: ViewContext2D,
  opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo; scrollInfo: ScrollInfo; style: MiddlewareScrollerStyle }
) {
  const ctx = overlayContext;
  const { viewScaleInfo, viewSizeInfo, scrollInfo, style } = opts;
  const { activeThumbType, prevPoint, activePoint, hoverXThumb, hoverYThumb } = scrollInfo;
  // const { width, height } = viewSizeInfo;
  const wrapper = calcScrollerInfo({ viewScaleInfo, viewSizeInfo, hoverXThumb, hoverYThumb, style });
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

  // // x-bar
  // if (scrollConfig.showScrollBar === true) {
  //   ctx.fillStyle = wrapper.scrollBarColor;
  //   // x-line
  //   ctx.fillRect(0, height - wrapper.lineSize, width, wrapper.lineSize);
  // }

  // x-thumb
  drawScrollerThumb(ctx, {
    axis: 'X',
    ...xThumbRect,
    r: wrapper.lineSize / 2,
    background: wrapper.xThumbBackground,
    borderColor: wrapper.xThumbBorderColor
  });

  // // y-bar
  // if (scrollConfig.showScrollBar === true) {
  //   ctx.fillStyle = wrapper.scrollBarColor;
  //   // y-line
  //   ctx.fillRect(width - wrapper.lineSize, 0, wrapper.lineSize, height);
  // }

  // y-thumb
  drawScrollerThumb(ctx, {
    axis: 'Y',
    ...yThumbRect,
    r: wrapper.lineSize / 2,
    background: wrapper.yThumbBackground,
    borderColor: wrapper.yThumbBorderColor
  });

  return {
    xThumbRect,
    yThumbRect
  };
}

export function drawScroller(ctx: ViewContext2D, opts: { snapshot: BoardViewerFrameSnapshot; style: MiddlewareScrollerStyle }) {
  const { snapshot, style } = opts;
  const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);
  const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
  const scrollInfo = getScrollInfoFromSnapshot(snapshot);
  const { xThumbRect, yThumbRect } = drawScrollerInfo(ctx, { viewSizeInfo, viewScaleInfo, scrollInfo, style });
  return { xThumbRect, yThumbRect };
}
