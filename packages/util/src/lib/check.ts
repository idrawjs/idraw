// import { DataElementAttrs } from '@idraw/types';
import { is } from './is';

function attrs(attrs: any): boolean {
  const { x, y, w, h, angle } = attrs;
  if (!(is.x(x) && is.y(y) && is.w(w) && is.h(h) && is.angle(angle))) {
    return false;
  }
  if (!(angle >= -360 && angle <= 360)) {
    return false;
  }
  return true;
}

function box(detail: any = {}): boolean {
  const { borderColor, borderRadius, borderWidth } = detail;
  if (detail.hasOwnProperty('borderColor') && !is.color(borderColor)) {
    return false;
  }
  if (detail.hasOwnProperty('borderRadius') && !is.number(borderRadius)) {
    return false;
  }
  if (detail.hasOwnProperty('borderWidth') && !is.number(borderWidth)) {
    return false;
  }
  return true;
}

function rectDesc(detail: any): boolean {
  const { background } = detail;
  if (detail.hasOwnProperty('background') && !is.color(background)) {
    return false;
  }
  if (!box(detail)) {
    return false;
  }
  return true;
}

function circleDesc(detail: any): boolean {
  const { background, borderColor, borderWidth } = detail;
  if (detail.hasOwnProperty('background') && !is.color(background)) {
    return false;
  }
  if (detail.hasOwnProperty('borderColor') && !is.color(borderColor)) {
    return false;
  }
  if (detail.hasOwnProperty('borderWidth') && !is.number(borderWidth)) {
    return false;
  }
  return true;
}

function imageDesc(detail: any): boolean {
  const { src } = detail;
  if (!is.imageSrc(src)) {
    return false;
  }
  return true;
}

function svgDesc(detail: any): boolean {
  const { svg } = detail;
  if (!is.svg(svg)) {
    return false;
  }
  return true;
}

function htmlDesc(detail: any): boolean {
  const { html } = detail;
  if (!is.html(html)) {
    return false;
  }
  return true;
}

function textDesc(detail: any): boolean {
  const { text, color, fontSize, lineHeight, fontFamily, textAlign, fontWeight, background, strokeWidth, strokeColor } = detail;
  if (!is.text(text)) {
    return false;
  }
  if (!is.color(color)) {
    return false;
  }
  if (!is.fontSize(fontSize)) {
    return false;
  }
  if (detail.hasOwnProperty('background') && !is.color(background)) {
    return false;
  }
  if (detail.hasOwnProperty('fontWeight') && !is.fontWeight(fontWeight)) {
    return false;
  }
  if (detail.hasOwnProperty('lineHeight') && !is.lineHeight(lineHeight)) {
    return false;
  }
  if (detail.hasOwnProperty('fontFamily') && !is.fontFamily(fontFamily)) {
    return false;
  }
  if (detail.hasOwnProperty('textAlign') && !is.textAlign(textAlign)) {
    return false;
  }
  if (detail.hasOwnProperty('strokeWidth') && !is.strokeWidth(strokeWidth)) {
    return false;
  }
  if (detail.hasOwnProperty('strokeColor') && !is.color(strokeColor)) {
    return false;
  }

  if (!box(detail)) {
    return false;
  }
  return true;
}

export const check = {
  attrs,
  textDesc,
  rectDesc,
  circleDesc,
  imageDesc,
  svgDesc,
  htmlDesc
};
