import { isColorStr } from '@idraw/util';

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
  return (
    typeof value === 'string' &&
    /^(http:\/\/|https:\/\/|\.\/|\/)/.test(`${value}`)
  );
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

function lineSpacing(value: any) {
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

const is: IsTypeUtil = {
  x,
  y,
  w,
  h,
  angle,
  number,
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
  lineSpacing,
  textAlign,
  fontFamily,
  fontWeight,
  strokeWidth
};

type IsTypeUtil = {
  x: (value: any) => boolean;
  y: (value: any) => boolean;
  w: (value: any) => boolean;
  h: (value: any) => boolean;
  angle: (value: any) => boolean;
  number: (value: any) => boolean;
  borderWidth: (value: any) => boolean;
  borderRadius: (value: any) => boolean;
  color: (value: any) => boolean;
  imageSrc: (value: any) => boolean;
  imageURL: (value: any) => boolean;
  imageBase64: (value: any) => boolean;
  svg: (value: any) => boolean;
  html: (value: any) => boolean;
  text: (value: any) => boolean;
  fontSize: (value: any) => boolean;
  fontWeight: (value: any) => boolean;
  lineHeight: (value: any) => boolean;
  lineSpacing: (value: any) => boolean;
  textAlign: (value: any) => boolean;
  fontFamily: (value: any) => boolean;
  strokeWidth: (value: any) => boolean;
};

export default is;

export { IsTypeUtil };
