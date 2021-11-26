type TempDataDesc = {
  hasInited: boolean;
}

function createData(): TempDataDesc {
  return {
    hasInited: false,
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