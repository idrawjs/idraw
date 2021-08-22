import { TypePoint } from '@idraw/types'

type TempDataDesc = {
  prevClickPoint: TypePoint & { t: number } | null,
}


export class TempData {

  private _temp: TempDataDesc

  constructor() {
    this._temp = {
      prevClickPoint: null
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
      prevClickPoint: null,
    }
  }
}