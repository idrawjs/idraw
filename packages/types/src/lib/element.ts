// import { TypePaintData } from './paint';

type TypeElement<T extends keyof TypeElemDesc> = {
  name?: string;
  uuid: string;
  type: T;
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  desc: TypeElemDesc[T];
}

type TypeElemDesc = {
  text: TypeElemDescText,
  rect: TypeElemDescRect,
  circle: TypeElemDescCircle,
  image: TypeElemDescImage,
  svg: TypeElemDescSVG,
  // paint: TypeElemDescPaint,
}

type TypeElemDescRect = {
  color: string;
}

type TypeElemDescText = {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: string;
  fontFamily?: string;
  backgroundColor?: string;
}

type TypeElemDescCircle = {
  r: number;
  x: number;
  y: number;
}

type TypeElemDescImage = {
  src: string;
}

type TypeElemDescSVG = {
  svg: string;
}

// type TypeElemDescPaint = TypePaintData

export {
  TypeElemDescText,
  TypeElemDescRect,
  TypeElemDescCircle,
  TypeElemDescImage,
  TypeElemDescSVG,
  TypeElemDesc,
  TypeElement,
};