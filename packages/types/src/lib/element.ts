// import { TypePaintData } from './paint';

type TypeElementAttrs = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
}

type TypeElementBase <T extends keyof TypeElemDesc> = TypeElementAttrs & {
  name?: string;
  uuid?: string;
  type: T;
  lock?: boolean;
  desc: TypeElemDesc[T];
}

type TypeElement<T extends keyof TypeElemDesc> = TypeElementBase<T> & {
  uuid: string;
}

type TypeElemBoxDesc = {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

type TypeElemDesc = {
  'text': TypeElemDescText,
  'rect': TypeElemDescRect,
  'circle': TypeElemDescCircle,
  'image': TypeElemDescImage,
  'svg': TypeElemDescSVG,
  'html': TypeElemDescHTML,
  // paint: TypeElemDescPaint,
}

type TypeElemDescRect = {
  color?: string;
} & TypeElemBoxDesc

type TypeElemDescText = {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: 'bold' | '';
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  bgColor: string;
} & TypeElemBoxDesc

type TypeElemDescCircle = {
  color: string;
} & TypeElemBoxDesc

type TypeElemDescImage = {
  src: string;
}

type TypeElemDescSVG = {
  svg: string;
}

type TypeElemDescHTML = {
  html: string;
}

// type TypeElemDescPaint = TypePaintData

export {
  TypeElementAttrs,
  TypeElemDescText,
  TypeElemDescRect,
  // TypeElemDescCircle,
  TypeElemDescImage,
  TypeElemDescSVG,
  TypeElemDesc,
  TypeElement,
  TypeElementBase,
};