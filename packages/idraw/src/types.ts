import { IDrawData, CoreOptions } from '@idraw/types';

export type Options = {
  maxRecords?: number;
  disableKeyboard?: boolean;
} & CoreOptions;

export type PrivateOptions = {
  maxRecords: number;
  disableKeyboard: boolean;
} & Options;

export type Record = {
  data: IDrawData;
  time: number;
};
