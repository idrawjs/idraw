import type { Element, ElementSize } from '@idraw/types';
import { formatNumber } from './number';

const doNum = (n: number) => {
  return formatNumber(n, { decimalPlaces: 4 });
};

interface ResizeOptions {
  xRatio: number;
  yRatio: number;
  minRatio: number;
  maxRatio: number;
}

function resizeElementBaseDetail(elem: Element, opts: ResizeOptions) {
  const { detail } = elem;
  const { xRatio, yRatio, maxRatio } = opts;
  const middleRatio = (xRatio + yRatio) / 2;
  const { borderWidth, borderRadius, borderDash, shadowOffsetX, shadowOffsetY, shadowBlur } = detail;
  if (typeof borderWidth === 'number') {
    detail.borderWidth = doNum(borderWidth * middleRatio);
  } else if (Array.isArray(detail.borderWidth)) {
    const bw = borderWidth as [number, number, number, number];
    // [top, right, bottom, left]
    detail.borderWidth = [doNum(bw[0] * yRatio), doNum(bw[1] * xRatio), doNum(bw[2] * yRatio), doNum(bw[3] * xRatio)];
  }

  if (typeof borderRadius === 'number') {
    detail.borderRadius = doNum(borderRadius * middleRatio);
  } else if (Array.isArray(detail.borderRadius)) {
    const br = borderRadius as [number, number, number, number];
    // [top-left, top-right, bottom-left, bottom-right]
    detail.borderRadius = [br[0] * xRatio, br[1] * xRatio, br[2] * yRatio, br[3] * yRatio];
  }

  if (Array.isArray(borderDash)) {
    borderDash.forEach((dash: number, i) => {
      (detail.borderDash as number[])[i] = doNum(dash * maxRatio);
    });
  }

  if (typeof shadowOffsetX === 'number') {
    detail.shadowOffsetX = doNum(shadowOffsetX * maxRatio);
  }
  if (typeof shadowOffsetY === 'number') {
    detail.shadowOffsetX = doNum(shadowOffsetY * maxRatio);
  }
  if (typeof shadowBlur === 'number') {
    detail.shadowOffsetX = doNum(shadowBlur * maxRatio);
  }
}

function resizeElementBase(elem: Element, opts: ResizeOptions) {
  const { xRatio, yRatio } = opts;
  const { x, y, w, h } = elem;
  elem.x = doNum(x * xRatio);
  elem.y = doNum(y * yRatio);
  elem.w = doNum(w * xRatio);
  elem.h = doNum(h * yRatio);
  resizeElementBaseDetail(elem, opts);
}

function resizeTextElementDetail(elem: Element<'text'>, opts: ResizeOptions) {
  const { minRatio, maxRatio } = opts;
  const { fontSize, lineHeight } = elem.detail;
  const ratio = (minRatio + maxRatio) / 2;

  if (fontSize && fontSize > 0) {
    elem.detail.fontSize = doNum(fontSize * ratio);
  }
  if (lineHeight && lineHeight > 0) {
    elem.detail.lineHeight = doNum(lineHeight * ratio);
  }
}

function resizeElement(elem: Element, opts: ResizeOptions) {
  const { type } = elem;
  // base and rect
  resizeElementBase(elem, opts);

  if (type === 'circle') {
    // TODO
  } else if (type === 'text') {
    resizeTextElementDetail(elem as Element<'text'>, opts);
  } else if (type === 'image') {
    // TODO
  } else if (type === 'svg') {
    // TODO
  } else if (type === 'html') {
    // TODO
  } else if (type === 'path') {
    // TODO
  } else if (type === 'group' && Array.isArray((elem as Element<'group'>).detail.children)) {
    (elem as Element<'group'>).detail.children.forEach((child) => {
      resizeElement(child, opts);
    });
  }
}

export function deepResizeGroupElement(elem: Element<'group'>, size: Pick<Partial<ElementSize>, 'w' | 'h'>): Element<'group'> {
  const resizeW: number = size.w && size.w > 0 ? size.w : elem.w;
  const resizeH: number = size.h && size.h > 0 ? size.h : elem.h;
  const xRatio = resizeW / elem.w;
  const yRatio = resizeH / elem.h;
  if (xRatio === yRatio && xRatio === 1) {
    return elem;
  }

  const minRatio = Math.min(xRatio, yRatio);
  const maxRatio = Math.max(xRatio, yRatio);

  elem.w = resizeW;
  elem.h = resizeH;
  const opts = { xRatio, yRatio, minRatio, maxRatio };
  if (elem.type === 'group' && Array.isArray(elem.detail.children)) {
    elem.detail.children.forEach((child) => {
      resizeElement(child, opts);
    });
  }
  resizeElementBaseDetail(elem, opts);
  return elem;
}
