import {
  TypeElement,
  TypeElemDesc,
  TypePoint,
  TypeData,
  TypeScreenData,
} from '@idraw/types';

export type TypeCoreEventSelectBaseArg = {
  index: number | null;
  uuid: string | null;
}

export type TypeCoreEventArgMap  = {
  'error': any;
  'mouseOverScreen': TypePoint,
  'mouseLeaveScreen': void,
  'mouseOverElement': TypeCoreEventSelectBaseArg & { element: TypeElement<keyof TypeElemDesc> }
  'mouseLeaveElement': TypeCoreEventSelectBaseArg & { element: TypeElement<keyof TypeElemDesc> }
  'screenClickElement': TypeCoreEventSelectBaseArg & { element: TypeElement<keyof TypeElemDesc> }
  'screenDoubleClickElement': TypeCoreEventSelectBaseArg & { element: TypeElement<keyof TypeElemDesc> }
  'screenSelectElement': TypeCoreEventSelectBaseArg & { element: TypeElement<keyof TypeElemDesc> }
  'screenMoveElementStart': TypeCoreEventSelectBaseArg & TypePoint,
  'screenMoveElementEnd': TypeCoreEventSelectBaseArg & TypePoint,
  'screenChangeElement': TypeCoreEventSelectBaseArg & { width: number, height: number, angle: number};
  'changeData': TypeData;
  'changeScreen': TypeScreenData
}
 
export interface TypeCoreEvent {
  on<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void): void
  off<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void): void
  trigger<T extends keyof TypeCoreEventArgMap >(key: T, p: TypeCoreEventArgMap[T]): void
}


export class CoreEvent implements TypeCoreEvent {

  private _listeners: Map<string, ((p: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
  }

  on<T extends keyof TypeCoreEventArgMap >(eventKey: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks || []);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }
  
  off<T extends keyof TypeCoreEventArgMap >(eventKey: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
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

  trigger<T extends keyof TypeCoreEventArgMap >(eventKey: T, arg: TypeCoreEventArgMap[T]) {
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

  has<T extends keyof TypeCoreEventArgMap> (name: string) {
    if (this._listeners.has(name)) {
      const list: ((p: TypeCoreEventArgMap[T]) => void)[] | undefined = this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }

}