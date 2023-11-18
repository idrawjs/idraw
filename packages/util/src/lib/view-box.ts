import type { Element, ViewScaleInfo, ViewSizeInfo, ViewBoxSize } from '@idraw/types';
import { getDefaultElementDetailConfig } from './config';
const defaultElemConfig = getDefaultElementDetailConfig();

export function calcViewBoxSize(viewElem: Element, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewBoxSize {
  const { viewScaleInfo } = opts;
  const { scale } = viewScaleInfo;
  let { borderRadius, boxSizing = defaultElemConfig.boxSizing, borderWidth } = viewElem.detail;
  if (typeof borderWidth !== 'number') {
    // TODO: If borderWidth is an array, borderRadius will not take effect and will become 0.
    borderRadius = 0;
  }
  let { x, y, w, h } = viewElem;
  let radiusList: [number, number, number, number] = [0, 0, 0, 0];
  if (typeof borderRadius === 'number') {
    const br = borderRadius * scale;
    radiusList = [br, br, br, br];
  } else if (Array.isArray(borderRadius) && borderRadius?.length === 4) {
    radiusList = [borderRadius[0] * scale, borderRadius[1] * scale, borderRadius[2] * scale, borderRadius[3] * scale];
  }
  let bw: number = 0;
  if (typeof borderWidth === 'number') {
    bw = (borderWidth || 1) * scale;
  }
  if (boxSizing === 'border-box') {
    x = viewElem.x + bw / 2;
    y = viewElem.y + bw / 2;
    w = viewElem.w - bw;
    h = viewElem.h - bw;
  } else if (boxSizing === 'content-box') {
    x = viewElem.x - bw / 2;
    y = viewElem.y - bw / 2;
    w = viewElem.w + bw;
    h = viewElem.h + bw;
  } else {
    x = viewElem.x;
    y = viewElem.y;
    w = viewElem.w;
    h = viewElem.h;
  }

  // r = Math.min(r, w / 2, h / 2);
  // if (w < r * 2 || h < r * 2) {
  //   r = 0;
  // }

  // ctx.beginPath();
  // ctx.moveTo(x + radiusList[0], y);
  // ctx.arcTo(x + w, y, x + w, y + h, radiusList[1]);
  // ctx.arcTo(x + w, y + h, x, y + h, radiusList[2]);
  // ctx.arcTo(x, y + h, x, y, radiusList[3]);
  // ctx.arcTo(x, y, x + w, y, radiusList[0]);
  // ctx.closePath();

  return {
    x,
    y,
    w,
    h,
    radiusList
  };
}
