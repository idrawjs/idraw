import type { Element, ViewScaleInfo, ViewSizeInfo, ViewBoxSize } from '@idraw/types';
import { getDefaultElementDetailConfig } from './config';
const defaultElemConfig = getDefaultElementDetailConfig();

export function calcViewBoxSize(viewElem: Element, opts: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ViewBoxSize {
  const { viewScaleInfo } = opts;
  const { scale } = viewScaleInfo;
  let { borderRadius, borderDash } = viewElem.detail;
  const hasBorderDash = Array.isArray(borderDash) && borderDash.length > 0;

  const { boxSizing = defaultElemConfig.boxSizing, borderWidth } = viewElem.detail;

  if (Array.isArray(borderWidth)) {
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
    bw = (borderWidth || 0) * scale;
  }
  if (boxSizing === 'border-box' && !hasBorderDash) {
    // TODO
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

  // TODO
  w = Math.max(w, 1);
  h = Math.max(h, 1);
  radiusList = radiusList.map((r) => {
    return Math.min(r, w / 2, h / 2);
  }) as [number, number, number, number];

  return {
    x,
    y,
    w,
    h,
    radiusList
  };
}
