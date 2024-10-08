import { PointSize } from './point';
import type { SVGPathCommand } from './svg-path';

export interface ElementSize {
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  operations?: ElementOperations;
}

export type ElementClipPath = Pick<ElementPathDetail, 'commands' | 'originX' | 'originY' | 'originW' | 'originH'>;

export interface TransformMatrix {
  method: 'matrix';
  args: [number, number, number, number, number];
}

export interface ElementAssetsItem {
  type: 'svg' | 'image' | 'html';
  value: string;
}

export interface ElementAssets {
  [assetId: string]: ElementAssetsItem;
}

export interface TransformTranslate {
  method: 'translate';
  args: [number, number];
}

export interface TransformRotate {
  method: 'rotate';
  args: [number];
}

export interface TransformScale {
  method: 'scale';
  args: [number, number];
}

export type TransformAction = TransformMatrix | TransformTranslate | TransformRotate | TransformScale;

export interface GradientStop {
  offset: number;
  color: string;
}

export interface LinearGradientColor {
  type: 'linear-gradient';
  start: PointSize;
  end: PointSize;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

type GadialCircle = PointSize & {
  radius: number;
};

export interface RadialGradientColor {
  type: 'radial-gradient';
  inner: GadialCircle;
  outer: GadialCircle;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

export interface ElementBaseDetail {
  boxSizing?: 'content-box' | 'border-box' | 'center-line'; // default center-line
  borderWidth?: number | [number, number, number, number]; // [top, right, bottom, left]
  borderColor?: string;
  borderRadius?: number | [number, number, number, number]; // [top-left, top-right, bottom-left, bottom-right]
  borderDash?: number[];
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  background?: string | LinearGradientColor | RadialGradientColor;
  opacity?: number;
  clipPath?: ElementClipPath;
  clipPathStrokeWidth?: number;
  clipPathStrokeColor?: string;
}

// interface ElementRectDetail extends ElementBaseDetail {
//   // color?: string;
//   // background?: string;
// }

export interface ElementRectDetail extends ElementBaseDetail {}

export interface ElementTextDetail extends ElementBaseDetail {
  text: string;
  color?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: 'bold' | string | number;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textShadowBlur?: number;
  minInlineSize?: 'maxContent' | 'auto';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  wordBreak?: 'break-all' | 'normal'; // default: 'normal'
  overflow?: 'hidden' | 'visible'; // default: 'hidden'
}

export interface ElementCircleDetail extends ElementBaseDetail {
  radius: number;
  background?: string;
}

export interface ElementHTMLDetail extends ElementBaseDetail {
  html: string;
  originW?: number;
  originH?: number;
}

export interface ElementImageDetail extends ElementBaseDetail {
  src: string;
  originW?: number;
  originH?: number;
  scaleMode?: 'auto' | 'fill' | 'fit' | 'tile';
}

export interface ElementSVGDetail extends ElementBaseDetail {
  svg: string;
}

export interface ElementGroupDetail extends ElementBaseDetail {
  children: Element<ElementType>[];
  overflow?: 'hidden' | 'visible';
  assets?: ElementAssets;
}

export type ElementPathDetail = ElementBaseDetail & {
  // path: string;
  commands: SVGPathCommand[];
  originX: number;
  originY: number;
  originW: number;
  originH: number;
  fill?: string | LinearGradientColor | RadialGradientColor;
  stroke?: string;
  strokeWidth?: number;
  strokeLineCap?: 'butt' | 'round' | 'square';
  fillRule?: string; // "evenodd" | "nonzero"
};

export interface ElementDetailMap {
  rect: ElementRectDetail;
  circle: ElementCircleDetail;
  text: ElementTextDetail;
  image: ElementImageDetail;
  html: ElementHTMLDetail;
  svg: ElementSVGDetail;
  group: ElementGroupDetail;
  path: ElementPathDetail;
}

// export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'svg' | 'html' | 'group';
export type ElementType = keyof ElementDetailMap;

export interface ElementOperations {
  locked?: boolean;
  invisible?: boolean;
  rotatable?: boolean;
  limitRatio?: boolean;
  deepResize?: boolean;
  lastModified?: number;
}

export interface ElementGlobalDetail {
  background?: string;
}

export interface Element<T extends ElementType = ElementType, E extends Record<string, any> = Record<string, any>> extends ElementSize {
  uuid: string;
  name?: string;
  type: T;
  detail: ElementDetailMap[T];
  operations?: ElementOperations;
  extends?: E;
  global?: ElementGlobalDetail;
}

export type Elements = Element<ElementType>[];

export type ElementPosition = number[];
