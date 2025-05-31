import type { ViewContext2D } from '@idraw/types';
import { createOffscreenContext2D } from '@idraw/util';
import { drawElement } from '@idraw/renderer';
import { createIconRotate } from './icon-rotate';

export function createRotateControllerPattern(opts: { fill: string; devicePixelRatio: number }): { context2d: ViewContext2D; fill: string } {
  const { fill, devicePixelRatio } = opts;
  const iconRotate = createIconRotate({ fill });
  const { w, h } = iconRotate;
  const context2d = createOffscreenContext2D({
    width: w,
    height: h,
    devicePixelRatio
  });

  // context2d.fillStyle = 'red'; // TODO
  // context2d.fillRect(0, 0, size, size);

  drawElement(context2d, iconRotate, {
    loader: undefined as any,
    viewScaleInfo: {
      scale: 1,
      offsetTop: 0,
      offsetBottom: 0,
      offsetLeft: 0,
      offsetRight: 0
    },
    viewSizeInfo: {
      width: w,
      height: h,
      devicePixelRatio,
      contextWidth: w,
      contextHeight: h
    },
    parentElementSize: {
      x: 0,
      y: 0,
      w,
      h
    },
    parentOpacity: 1
  });

  // context2d.fill = fill;

  return { context2d, fill };
}
