import { TypePaintData } from './paint';

type TypeElement<T extends keyof TypeElemDesc> = {
  uuid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: T;
  desc: TypeElemDesc[T];
}

type TypeElemDesc = {
  text: TypeElemDescText,
  rect: TypeElemDescRect,
  circle: TypeElemDescCircle,
  image: TypeElemDescImage,
  paint: TypeElemDescPaint
}

type TypeElemDescRect = {
  color: string;
}

type TypeElemDescText = {
  size: number;
  color: number;
}

type TypeElemDescCircle = {
  r: number;
  x: number;
  y: number;
}

type TypeElemDescImage = {
  src: number;
}

type TypeElemDescPaint = TypePaintData

export {
  TypeElemDescText,
  TypeElemDescRect,
  TypeElemDescCircle,
  TypeElemDesc,
  TypeElement,
}