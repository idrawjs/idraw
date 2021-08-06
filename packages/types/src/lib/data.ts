import { TypeElemDesc, TypeElement, TypeElementBase } from './element';

type TypeDataBase = {
  elements: TypeElementBase<keyof TypeElemDesc>[];
  bgColor?: string;
}

type TypeData = {
  elements: TypeElement<keyof TypeElemDesc>[];
  bgColor?: string;
}


export {
  TypeData,
  TypeDataBase,
};