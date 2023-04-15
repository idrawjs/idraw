export interface ElementSize {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ElementRectDesc {
  color?: string;
  bgColor?: string;
  borderRadius?: number;
}

interface ElemenTextDesc {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: 'bold' | '';
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

interface ElementCircleDesc {
  radius: number;
  bgColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

interface ElementBaseDesc {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
}

interface ElementHTMLDesc extends ElementBaseDesc {
  html: string;
  width: number;
  height: number;
}

interface ElementImageDesc extends ElementBaseDesc {
  src: string;
}

interface ElementSVGDesc extends ElementBaseDesc {
  svg: string;
}

interface ElementDescMap {
  rect: ElementRectDesc;
  circle: ElementCircleDesc;
  text: ElemenTextDesc;
  image: ElementImageDesc;
  html: ElementHTMLDesc;
  svg: ElementSVGDesc;
}

export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'svg' | 'html';

export interface ElementOperation {
  lock?: boolean;
  invisible?: boolean;
  disableScale?: boolean;
  disableRotate?: boolean;
  limitRatio?: boolean;
  lastModified?: number;
}

export interface Element<T extends ElementType> {
  uuid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: T;
  desc: ElementDescMap[T];
  operation?: ElementOperation;
}
