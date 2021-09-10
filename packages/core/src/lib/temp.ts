import { TypeHelperWrapperDotDirection, TypePoint } from '@idraw/types';

type TempDataDesc = {
  hasInited: boolean;
  selectedUUID: string | null,
  selectedUUIDList: string[],
  hoverUUID: string | null,
  selectedDotDirection: TypeHelperWrapperDotDirection | null,
  prevPoint: TypePoint | null,
}

function createData(): TempDataDesc {
  return {
    hasInited: false,
    selectedUUID: null,
    selectedUUIDList: [],
    hoverUUID: null,
    selectedDotDirection: null,
    prevPoint: null,
  }
}


export class TempData {

  private _temp: TempDataDesc

  constructor() {
    this._temp = createData();
  }

  set<T extends keyof TempDataDesc >(name: T, value:  TempDataDesc[T]) {
    this._temp[name] = value;
  }

  get<T extends keyof TempDataDesc >(name: T): TempDataDesc[T] {
    return this._temp[name];
  }

  clear() {
    this._temp = createData();
  }
}