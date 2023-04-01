import { DataElemDesc, DataElement, DataElementBase } from './element';

type IDrawDataBase = {
  elements: DataElementBase<keyof DataElemDesc>[];
  bgColor?: string;
};

type IDrawData = {
  elements: DataElement<keyof DataElemDesc>[];
  bgColor?: string;
};

export { IDrawData, IDrawDataBase };
