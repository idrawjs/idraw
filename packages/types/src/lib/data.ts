import { TypeElemDesc, TypeElement } from './element';


type TypeData = {
  elements: TypeElement<keyof TypeElemDesc>[];
  bgColor?: string;
}

export {
  TypeData
}