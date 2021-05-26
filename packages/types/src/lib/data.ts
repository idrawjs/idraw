import { TypeElemDesc, TypeElement } from './element';



type TypeData = {
  elements: TypeElement<keyof TypeElemDesc>[]
  selectedElements?: string[] // uuids
}

export {
  TypeData
}