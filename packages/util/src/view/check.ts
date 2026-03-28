import { MaterialSize } from '@idraw/types';

import { is } from './is';

function attrs(attrs: MaterialSize): boolean {
  const { x, y, width, height, angle = 0 } = attrs;
  if (!(is.x(x) && is.y(y) && is.width(width) && is.height(height) && is.angle(angle))) {
    return false;
  }
  if (!(angle >= -360 && angle <= 360)) {
    return false;
  }
  return true;
}

function box(attributes: any = {}): boolean {
  const { stroke, cornerRadius, strokeWidth } = attributes;
  if (Object.prototype.hasOwnProperty.call(attributes, 'stroke') && !is.color(stroke)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'cornerRadius') && !is.number(cornerRadius)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'strokeWidth') && !is.number(strokeWidth)) {
    return false;
  }
  return true;
}

function rectDesc(attributes: any): boolean {
  const { background } = attributes;
  if (Object.prototype.hasOwnProperty.call(attributes, 'background') && !is.color(background)) {
    return false;
  }
  if (!box(attributes)) {
    return false;
  }
  return true;
}

function circleDesc(attributes: any): boolean {
  const { background, stroke, strokeWidth } = attributes;
  if (Object.prototype.hasOwnProperty.call(attributes, 'background') && !is.color(background)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'stroke') && !is.color(stroke)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'strokeWidth') && !is.number(strokeWidth)) {
    return false;
  }
  return true;
}

function imageDesc(attributes: any): boolean {
  const { href } = attributes;
  if (!is.imageSrc(href)) {
    return false;
  }
  return true;
}

function svgDesc(attributes: any): boolean {
  const { svg } = attributes;
  if (!is.svg(svg)) {
    return false;
  }
  return true;
}

function htmlDesc(attributes: any): boolean {
  const { html } = attributes;
  if (!is.html(html)) {
    return false;
  }
  return true;
}

function textDesc(attributes: any): boolean {
  const { text, color, fontSize, lineHeight, fontFamily, textAlign, fontWeight, background, strokeWidth, strokeColor } =
    attributes;
  if (!is.text(text)) {
    return false;
  }
  if (!is.color(color)) {
    return false;
  }
  if (!is.fontSize(fontSize)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'background') && !is.color(background)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'fontWeight') && !is.fontWeight(fontWeight)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'lineHeight') && !is.lineHeight(lineHeight)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'fontFamily') && !is.fontFamily(fontFamily)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'textAlign') && !is.textAlign(textAlign)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'strokeWidth') && !is.strokeWidth(strokeWidth)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(attributes, 'strokeColor') && !is.color(strokeColor)) {
    return false;
  }

  if (!box(attributes)) {
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
  htmlDesc,
};
