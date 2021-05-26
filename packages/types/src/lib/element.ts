import { TypePaintData } from './paint';

type TypeElementsDesc = {
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
  TypeElementsDesc,
}