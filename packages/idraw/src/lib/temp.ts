import { TypeElemDesc, TypeElement } from '@idraw/types';
import { Record } from './../types';


type TempDataDesc = {
  isFocus: boolean,
  doRecords: Record[],
  unDoRecords: Record[],
  clipboardElements: TypeElement<keyof TypeElemDesc>[]
}

export class TempData {

  private _temp: TempDataDesc

  constructor() {
    this._temp = {
      isFocus: false,
      doRecords: [],
      unDoRecords: [],
      clipboardElements: [],
    }
  }

  set<T extends keyof TempDataDesc >(name: T, value:  TempDataDesc[T]) {
    this._temp[name] = value;
  }

  get<T extends keyof TempDataDesc >(name: T): TempDataDesc[T] {
    return this._temp[name];
  }

  clear() {
    this._temp = {
      isFocus: false,
      doRecords: [],
      unDoRecords: [],
      clipboardElements: [],
    }
  }
}