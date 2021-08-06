import { TypeElemDesc, TypeElement, TypeElementBase } from './element';

type TypeDataBase = {
  elements: TypeElementBase<keyof TypeElemDesc>[];
  bgColor?: string;
}

type TypeData = TypeDataBase & {
  elements: TypeElement<keyof TypeElemDesc>[];
}

export {
  TypeData,
  TypeDataBase,
};