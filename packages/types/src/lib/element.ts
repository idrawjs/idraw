export interface ElementSize {
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
}

export interface ElementBaseDesc {
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  color?: string;
  bgColor?: string;
}

// interface ElementRectDesc extends ElementBaseDesc {
//   // color?: string;
//   // bgColor?: string;
// }

type ElementRectDesc = ElementBaseDesc;

interface ElemenTextDesc extends ElementBaseDesc {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: 'bold' | string;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';
  bgColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textShadowBlur?: number;
}

interface ElementCircleDesc extends ElementBaseDesc {
  radius: number;
  bgColor?: string;
}

interface ElementHTMLDesc extends ElementBaseDesc {
  html: string;
  width?: number;
  height?: number;
}

interface ElementImageDesc extends ElementBaseDesc {
  src: string;
}

interface ElementSVGDesc extends ElementBaseDesc {
  svg: string;
}

interface ElementGroupDesc extends ElementBaseDesc {
  bgColor?: string;
  children: Element<ElementType>[];
}

interface ElementDescMap {
  rect: ElementRectDesc;
  circle: ElementCircleDesc;
  text: ElemenTextDesc;
  image: ElementImageDesc;
  html: ElementHTMLDesc;
  svg: ElementSVGDesc;
  group: ElementGroupDesc;
}

export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'svg' | 'html' | 'group';

export interface ElementOperation {
  lock?: boolean;
  invisible?: boolean;
  disableScale?: boolean;
  disableRotate?: boolean;
  limitRatio?: boolean;
  lastModified?: number;
}

export interface Element<T extends ElementType> extends ElementSize {
  uuid: string;
  name?: string;
  type: T;
  desc: ElementDescMap[T];
  operation?: ElementOperation;
}
