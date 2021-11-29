import { TypeHelperWrapperControllerDirection, TypePoint } from '@idraw/types';
import { Mode, CursorStatus } from './../constant/static';

type TempDataDesc = {
  hasInited: boolean;
  onlyRender: boolean;
  mode: Mode,
  cursorStatus: CursorStatus
  selectedUUID: string | null,
  selectedUUIDList: string[],
  hoverUUID: string | null,
  selectedControllerDirection: TypeHelperWrapperControllerDirection | null,
  hoverControllerDirection: TypeHelperWrapperControllerDirection | null,
  prevPoint: TypePoint | null,
}

function createData(): TempDataDesc {
  return {
    onlyRender: false,
    hasInited: false,
    mode: Mode.NULL,
    cursorStatus: CursorStatus.NULL,
    selectedUUID: null,
    selectedUUIDList: [],
    hoverUUID: null,
    selectedControllerDirection: null,
    hoverControllerDirection: null,
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