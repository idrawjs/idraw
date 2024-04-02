// import { DataElementAttrs } from '@idraw/types';
import is from './is';

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

function box(desc: any = {}): boolean {
  const { borderColor, borderRadius, borderWidth } = desc;
  if (desc.hasOwnProperty('borderColor') && !is.color(borderColor)) {
    return false;
  }
  if (desc.hasOwnProperty('borderRadius') && !is.number(borderRadius)) {
    return false;
  }
  if (desc.hasOwnProperty('borderWidth') && !is.number(borderWidth)) {
    return false;
  }
  return true;
}

function rectDesc(desc: any): boolean {
  const { bgColor } = desc;
  if (desc.hasOwnProperty('bgColor') && !is.color(bgColor)) {
    return false;
  }
  if (!box(desc)) {
    return false;
  }
  return true;
}

function circleDesc(desc: any): boolean {
  const { bgColor, borderColor, borderWidth } = desc;
  if (desc.hasOwnProperty('bgColor') && !is.color(bgColor)) {
    return false;
  }
  if (desc.hasOwnProperty('borderColor') && !is.color(borderColor)) {
    return false;
  }
  if (desc.hasOwnProperty('borderWidth') && !is.number(borderWidth)) {
    return false;
  }
  return true;
}

function imageDesc(desc: any): boolean {
  const { src } = desc;
  if (!is.imageSrc(src)) {
    return false;
  }
  return true;
}

function svgDesc(desc: any): boolean {
  const { svg } = desc;
  if (!is.svg(svg)) {
    return false;
  }
  return true;
}

function htmlDesc(desc: any): boolean {
  const { html } = desc;
  if (!is.html(html)) {
    return false;
  }
  return true;
}

function textDesc(desc: any): boolean {
  const {
    text,
    color,
    fontSize,
    lineHeight,
    lineSpacing,
    fontFamily,
    textAlign,
    fontWeight,
    bgColor,
    strokeWidth,
    strokeColor
  } = desc;
  if (!is.text(text)) {
    return false;
  }
  if (!is.color(color)) {
    return false;
  }
  if (!is.fontSize(fontSize)) {
    return false;
  }
  if (desc.hasOwnProperty('bgColor') && !is.color(bgColor)) {
    return false;
  }
  if (desc.hasOwnProperty('fontWeight') && !is.fontWeight(fontWeight)) {
    return false;
  }
  if (desc.hasOwnProperty('lineHeight') && !is.lineHeight(lineHeight)) {
    return false;
  }
  if (desc.hasOwnProperty('lineSpacing') && !is.lineSpacing(lineSpacing)) {
    return false;
  }
  if (desc.hasOwnProperty('fontFamily') && !is.fontFamily(fontFamily)) {
    return false;
  }
  if (desc.hasOwnProperty('textAlign') && !is.textAlign(textAlign)) {
    return false;
  }
  if (desc.hasOwnProperty('strokeWidth') && !is.strokeWidth(strokeWidth)) {
    return false;
  }
  if (desc.hasOwnProperty('strokeColor') && !is.color(strokeColor)) {
    return false;
  }

  if (!box(desc)) {
    return false;
  }
  return true;
}

const check = {
  attrs,
  textDesc,
  rectDesc,
  circleDesc,
  imageDesc,
  svgDesc,
  htmlDesc
};

export default check;
