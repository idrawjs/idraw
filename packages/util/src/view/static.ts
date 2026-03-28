import type {
  // ViewScaleInfo,
  DefaultMaterialAttributes,
  MaterialSize,
  MaterialRectAttributes,
  MaterialCircleAttributes,
  MaterialTextAttributes,
  MaterialSVGCodeAttributes,
  MaterialImageAttributes,
  MaterialGroupAttributes,
} from '@idraw/types';

export const defaultText = 'Text';
export const defaultFill = '#787878';
export const defaultStroke = '#525252';
export const defaultImageSlotSVG = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="${defaultFill}"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM338 304c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64z m513.9 437.1c-1.4 1.2-3.3 1.9-5.2 1.9H177.2c-4.4 0-8-3.6-8-8 0-1.9 0.7-3.7 1.9-5.2l170.3-202c2.8-3.4 7.9-3.8 11.3-1 0.3 0.3 0.7 0.6 1 1l99.4 118 158.1-187.5c2.8-3.4 7.9-3.8 11.3-1 0.3 0.3 0.7 0.6 1 1l229.6 271.6c2.6 3.3 2.2 8.4-1.2 11.2z" ></path></svg>`;
export const defaultImageHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultImageSlotSVG)}`;

export function getDefaultMaterialAttributes(): DefaultMaterialAttributes {
  const config: DefaultMaterialAttributes = {
    // Transform and display attributes
    opacity: 1,
    display: 'inline',
    visibility: 'visible',
    overflow: 'visible',

    // Fill attributes
    fill: defaultFill,
    fillOpacity: 1,
    fillRule: 'nonzero',

    // Stroke attributes
    stroke: defaultStroke,
    strokeWidth: 0,
    strokeOpacity: 1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeDasharray: [],
    strokeDashoffset: 0,
    strokeMiterlimit: 0,

    // Text attributes
    text: defaultText,
    fontSize: 12, // TODO
    fontFamily: 'system-ui',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAnchor: 'start',
    textDecoration: 'none',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    writingMode: 'horizontal-tb',
    textAlign: 'left',
    verticalAlign: 'top',

    // Image attributes
    href: defaultImageHref,
  };
  return config;
}

export function getDefaultMaterialRectAttributes(): MaterialRectAttributes {
  const attributesConfig = getDefaultMaterialAttributes();
  const attributes: MaterialRectAttributes = {
    fill: attributesConfig.fill,
  };
  return attributes;
}

export function getDefaultMaterialCircleAttributes(): MaterialCircleAttributes {
  const attributesConfig = getDefaultMaterialAttributes();
  const attributes: MaterialCircleAttributes = {
    fill: attributesConfig.fill,
    cx: 200,
    cy: 200,
    r: 100,
  };
  return attributes;
}

export function getDefaultMaterialTextAttributes(materialSize: MaterialSize): MaterialTextAttributes {
  const attributesConfig = getDefaultMaterialAttributes();
  // const scale = opts?.viewScaleInfo?.scale || 1;
  const attributes: MaterialTextAttributes = {
    text: defaultText,
    fill: attributesConfig.fill as string,
    fontFamily: attributesConfig.fontFamily,
    fontWeight: attributesConfig.fontWeight,
    // lineHeight: materialSize.w / defaultText.length,
    fontSize: materialSize.width / defaultText.length,
    textAlign: 'center',
    verticalAlign: 'middle',
  };
  return attributes;
}

export function getDefaultMaterialSVGAttributes(): MaterialSVGCodeAttributes {
  const attributes: MaterialSVGCodeAttributes = {
    code: `<svg t="1701004189871" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"   width="200" height="200"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.1 32.9 0.6 45.3l183.7 179.1-43.4 252.9c-1.2 6.9-0.1 14.1 3.2 20.3 8.2 15.6 27.6 21.7 43.2 13.4L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"   fill="${defaultFill}"></path></svg>`,
  };
  return attributes;
}

export function getDefaultMaterialImageAttributes(): MaterialImageAttributes {
  const attributes: MaterialImageAttributes = {
    href: defaultImageHref,
  };
  return attributes;
}

export function getDefaultMaterialGroupAttributes(): MaterialGroupAttributes {
  const attributesConfig = getDefaultMaterialAttributes();
  const attributes: MaterialGroupAttributes = {
    children: [],
    fill: attributesConfig.fill,
    overflow: 'hidden',
  };
  return attributes;
}
