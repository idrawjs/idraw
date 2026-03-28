import { isColorStr } from '../tool/color';

function positiveNum(value: any) {
  return typeof value === 'number' && value >= 0;
}

function number(value: any) {
  return typeof value === 'number' && (value > 0 || value <= 0);
}

function x(value: any) {
  return number(value);
}

function y(value: any) {
  return number(value);
}

function width(value: any) {
  return positiveNum(value);
}

function height(value: any) {
  return positiveNum(value);
}

function angle(value: any) {
  return typeof value === 'number' && value >= -360 && value <= 360;
}

function strokeWidth(value: any) {
  return (
    positiveNum(value) ||
    (Array.isArray(value) &&
      positiveNum(value[0]) &&
      positiveNum(value[1]) &&
      positiveNum(value[2]) &&
      positiveNum(value[3]))
  );
}

function cornerRadius(value: any) {
  return (
    positiveNum(value) ||
    (Array.isArray(value) &&
      positiveNum(value[0]) &&
      positiveNum(value[1]) &&
      positiveNum(value[2]) &&
      positiveNum(value[3]))
  );
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
  return (
    typeof value === 'string' &&
    /^(<svg[\s]{1,}|<svg>)/i.test(`${value}`.trim()) &&
    /<\/[\s]{0,}svg>$/i.test(`${value}`.trim())
  );
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

function type(value: any) {
  return ['rect', 'circle', 'text', 'image', 'svgCode', 'foreignObject', 'group'].includes(value);
}

function material(mtrl: any) {
  if (!mtrl) {
    return false;
  }
  return type(mtrl?.type) && x(mtrl?.x) && y(mtrl?.y) && width(mtrl?.w) && height(mtrl?.h);
}

function layout(value: any) {
  if (!value) {
    return false;
  }
  return x(value?.x) && y(value?.y) && width(value?.w) && height(value?.h);
}

function data(d: any) {
  if (Array(d?.materials) && d?.materials.length >= 0) {
    return true;
  }
  return false;
}

export const is = {
  positiveNum,
  data,
  material,
  layout,
  type,
  x,
  y,
  width,
  height,
  angle,
  number,
  numberStr,
  strokeWidth,
  cornerRadius,
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
};
