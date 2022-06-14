import { TypePoint } from '@idraw/types';
import { deepClone } from '@idraw/util';

type TempDataDesc = {
  moveStartPoint: TypePoint & { t?: number } | null,
  prevClickPoint: TypePoint & { t?: number } | null,
  isHoverCanvas: boolean;
  isDragCanvas: boolean;
  statusMap: {
    canScrollYPrev: boolean,
    canScrollYNext: boolean,
    canScrollXPrev: boolean,
    canScrollXNext: boolean,
  }
}

function createTempData() {
  return {
    moveStartPoint: null,
    prevClickPoint: null,
    isHoverCanvas: false,
    isDragCanvas: false,
    statusMap: {
      canScrollYPrev: true,
      canScrollYNext: true,
      canScrollXPrev: true,
      canScrollXNext: true,
    }
  }
}

export class TempData {

  private _temp: TempDataDesc

  constructor() {
    this._temp = createTempData();
  }

  set<T extends keyof TempDataDesc >(name: T, value:  TempDataDesc[T]) {
    this._temp[name] = value;
  }

  get<T extends keyof TempDataDesc >(name: T, opts?: { clone: boolean }): TempDataDesc[T] {
    if (opts?.clone === true) {
      return deepClone(this._temp[name]);
    }
    return this._temp[name];
  }

  clear() {
    this._temp = createTempData();
  }
}