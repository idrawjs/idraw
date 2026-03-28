import type { ViewScaleInfo, ViewSizeInfo, HTMLCSSProps } from '@idraw/types';
import { scrollbarTrackSize, scrollbarThumbLength } from './static';
import type { ScrollbarStyles } from './types';

export function calcScrollbarStyles(opts: {
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
}): ScrollbarStyles {
  const { viewScaleInfo, viewSizeInfo } = opts;
  const { width, height } = viewSizeInfo;
  const { offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
  const scrollerLineWidth = scrollbarTrackSize;
  const minThumbLength = scrollbarThumbLength;

  const sliderMinSize = minThumbLength;
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
  const xThumbStyle: HTMLCSSProps = {
    left: translateX,
    width: xSize,
  };
  const yThumbStyle: HTMLCSSProps = {
    top: translateY,
    height: ySize,
  };
  const scrollbarInfo: ScrollbarStyles = {
    xThumbStyle,
    yThumbStyle,
  };
  return scrollbarInfo;
}
