import { TypeElemDesc, TypeElement } from './element';


type TypeDataBase = {
  elements: TypeElement<keyof TypeElemDesc>[];
  bgColor?: string;
}


type TypeData = TypeDataBase & {}

export {
  TypeDataBase,
  TypeData
}