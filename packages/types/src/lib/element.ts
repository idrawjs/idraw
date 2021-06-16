// import { TypePaintData } from './paint';

type TypeElementAttrs = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
}

type TypeElement<T extends keyof TypeElemDesc> = TypeElementAttrs & {
  name?: string;
  uuid: string;
  type: T;
  desc: TypeElemDesc[T];
}

type TypeElemBoxDesc = {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

type TypeElemDesc = {
  text: TypeElemDescText,
  rect: TypeElemDescRect,
  // circle: TypeElemDescCircle,
  image: TypeElemDescImage,
  svg: TypeElemDescSVG,
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
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
} & TypeElemBoxDesc

// type TypeElemDescCircle = {
//   r: number;
//   x: number;
//   y: number;
// }

type TypeElemDescImage = {
  src: string;
}

type TypeElemDescSVG = {
  svg: string;
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
};