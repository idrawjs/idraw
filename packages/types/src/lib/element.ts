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

interface ElementEllipseDesc {
  radius: number;
  bgColor?: string;
  borderWidth?: number;
  borderColor?: string;
}

interface ElementBaseDesc {
  // TODO
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
  ellipse: ElementEllipseDesc;
  polygon: ElementBaseDesc; // TODO
  paint: ElementBaseDesc; // TODO
  pen: ElementBaseDesc; // TODO
  image: ElementImageDesc;
  html: ElementHTMLDesc;
  svg: ElementSVGDesc;
}

export type ElementType = 'rect' | 'ellipse' | 'polygon' | 'paint' | 'pen' | 'image' | 'html' | 'svg'; // TODO

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
