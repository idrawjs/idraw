import {
  TypeData,
  TypeCoreOptions,
} from '@idraw/types';

export type Options = {
  maxRecords?: number;
  disableKeyboard?: boolean;
} & TypeCoreOptions;

export type PrivateOptions = {
  maxRecords: number;
  disableKeyboard: boolean;
} & Options;

export type Record = {
  data: TypeData;
  time: number;
}