import { HelperWrapperControllerDirection, Point } from '@idraw/types';
import { Mode, CursorStatus } from '../constant/static';

type TempDataDesc = {
  hasInited: boolean;
  mode: Mode;
  cursorStatus: CursorStatus;
  selectedUUID: string | null;
  selectedUUIDList: string[];
  hoverUUID: string | null;
  selectedControllerDirection: HelperWrapperControllerDirection | null;
  hoverControllerDirection: HelperWrapperControllerDirection | null;
  prevPoint: Point | null;
  hasChangedElement: boolean;
};

function createData(): TempDataDesc {
  return {
    hasInited: false,
    mode: Mode.NULL,
    cursorStatus: CursorStatus.NULL,
    selectedUUID: null,
    selectedUUIDList: [],
    hoverUUID: null,
    selectedControllerDirection: null,
    hoverControllerDirection: null,
    prevPoint: null,
    hasChangedElement: false
  };
}

export class TempData {
  private _temp: TempDataDesc;

  constructor() {
    this._temp = createData();
  }

  set<T extends keyof TempDataDesc>(name: T, value: TempDataDesc[T]) {
    this._temp[name] = value;
  }

  get<T extends keyof TempDataDesc>(name: T): TempDataDesc[T] {
    return this._temp[name];
  }

  clear() {
    this._temp = createData();
  }
}
