import { TypePoint } from '@idraw/types';

export interface TypeBoardEventArgMap {
  'doubleClick': TypePoint;
  'hover': TypePoint;
  'point': TypePoint;
  'move': TypePoint;
  'moveStart': TypePoint;
  'moveEnd': TypePoint;
  'wheelX': number;
  'wheelY': number;
}

export interface TypeBoardEvent {
  on<T extends keyof TypeBoardEventArgMap >(key: T, callback: (p: TypeBoardEventArgMap[T]) => void): void
  off<T extends keyof TypeBoardEventArgMap >(key: T, callback: (p: TypeBoardEventArgMap[T]) => void): void
  trigger<T extends keyof TypeBoardEventArgMap >(key: T, p: TypeBoardEventArgMap[T]): void
}


export class BoardEvent implements TypeBoardEvent {

  private _listeners: Map<string, ((p: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
  }

  on<T extends keyof TypeBoardEventArgMap >(eventKey: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks || []);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }
  
  off<T extends keyof TypeBoardEventArgMap >(eventKey: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      if (Array.isArray(callbacks)) {
        for (let i = 0; i < callbacks?.length; i++) {
          if (callbacks[i] === callback) {
            callbacks.splice(i, 1);
            break;
          }
        }
      }
      this._listeners.set(eventKey, callbacks || []);
    }
  }

  trigger<T extends keyof TypeBoardEventArgMap >(eventKey: T, arg: TypeBoardEventArgMap[T]) {
    const callbacks = this._listeners.get(eventKey);
    if (Array.isArray(callbacks)) {
      callbacks.forEach((cb) => {
        cb(arg);
      });
      return true;
    } else {
      return false;
    }
  }

  has<T extends keyof TypeBoardEventArgMap> (name: string) {
    if (this._listeners.has(name)) {
      const list: ((p: TypeBoardEventArgMap[T]) => void)[] | undefined = this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }

}