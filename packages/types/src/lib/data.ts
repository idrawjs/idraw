import { TypeElementsDesc } from './element';

type TypeDataElement<T extends keyof TypeElementsDesc> = {
  uuid?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: T;
  desc: TypeElementsDesc[T];
}

type TypeData = {
  elements: TypeDataElement<keyof TypeElementsDesc>[]
  selectedElements?: string[] // uuids
}

export {
  TypeDataElement,
  TypeData
}