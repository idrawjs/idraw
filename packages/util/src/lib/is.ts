import { isColorStr } from './color';

function number(value: any) {
  return typeof value === 'number' && (value > 0 || value <= 0);
}

function x(value: any) {
  return number(value);
}

function y(value: any) {
  return number(value);
}

function w(value: any) {
  return typeof value === 'number' && value >= 0;
}

function h(value: any) {
  return typeof value === 'number' && value >= 0;
}

function angle(value: any) {
  return typeof value === 'number' && value >= -360 && value <= 360;
}

function borderWidth(value: any) {
  return w(value);
}

function borderRadius(value: any) {
  return number(value) && value >= 0;
}

function color(value: any) {
  return isColorStr(value);
}

function imageURL(value: any) {
  return typeof value === 'string' && /^(http:\/\/|https:\/\/|\.\/|\/)/.test(`${value}`);
}

function imageBase64(value: any) {
  return typeof value === 'string' && /^(data:image\/)/.test(`${value}`);
}

function imageSrc(value: any) {
  return imageBase64(value) || imageURL(value);
}

function svg(value: any) {
  return typeof value === 'string' && /^(<svg[\s]{1,}|<svg>)/i.test(`${value}`.trim()) && /<\/[\s]{0,}svg>$/i.test(`${value}`.trim());
}

function html(value: any) {
  let result = false;
  if (typeof value === 'string') {
    let div: null | HTMLDivElement = document.createElement('div');
    div.innerHTML = value;
    if (div.children.length > 0) {
      result = true;
    }
    div = null;
  }
  return result;
}

function text(value: any) {
  return typeof value === 'string';
}

function fontSize(value: any) {
  return number(value) && value > 0;
}

function lineHeight(value: any) {
  return number(value) && value > 0;
}

function strokeWidth(value: any) {
  return number(value) && value > 0;
}

function textAlign(value: any) {
  return ['center', 'left', 'right'].includes(value);
}

function fontFamily(value: any) {
  return typeof value === 'string' && value.length > 0;
}

function fontWeight(value: any) {
  return ['bold'].includes(value);
}

function numberStr(value: any): boolean {
  return /^(-?\d+(?:\.\d+)?)$/.test(`${value}`);
}

export const is = {
  x,
  y,
  w,
  h,
  angle,
  number,
  numberStr,
  borderWidth,
  borderRadius,
  color,
  imageSrc,
  imageURL,
  imageBase64,
  svg,
  html,
  text,
  fontSize,
  lineHeight,
  textAlign,
  fontFamily,
  fontWeight,
  strokeWidth
};
