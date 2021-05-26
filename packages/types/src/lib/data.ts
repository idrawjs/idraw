import { TypeElemDesc, TypeElement } from './element';



type TypeData = {
  elements: TypeElement<keyof TypeElemDesc>[];
  bgColor?: string;
  selectedElements?: string[]; // uuids
}

export {
  TypeData
}