import {
  TypeData,
  TypeCoreOptions,
} from '@idraw/types';

export type Options = {
  maxRecords?: number;
} & TypeCoreOptions;

export type PrivateOptions = {
  maxRecords: number;
} & Options;

export type Record = {
  data: TypeData;
  time: number;
}