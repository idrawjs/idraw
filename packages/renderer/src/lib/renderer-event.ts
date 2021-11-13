import { TypeElement, TypeElemDesc } from '@idraw/types';


export type TypeRendererEventArgMap = {
  'drawFrame': { t: number };
  'drawFrameComplete': { t: number };
  'load': { element: TypeElement<keyof TypeElemDesc> },
  'loadComplete': { t: number },
  'error': { element: TypeElement<keyof TypeElemDesc>, error: any }
}
 
export interface TypeRendererEvent {
  on<T extends keyof TypeRendererEventArgMap >(key: T, callback: (p: TypeRendererEventArgMap[T]) => void): void
  off<T extends keyof TypeRendererEventArgMap >(key: T, callback: (p: TypeRendererEventArgMap[T]) => void): void
  trigger<T extends keyof TypeRendererEventArgMap >(key: T, p: TypeRendererEventArgMap[T]): void
}


export class RendererEvent implements TypeRendererEvent {

  private _listeners: Map<string, ((p: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
  }

  on<T extends keyof TypeRendererEventArgMap >(eventKey: T, callback: (p: TypeRendererEventArgMap[T]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks || []);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }
  
  off<T extends keyof TypeRendererEventArgMap >(eventKey: T, callback: (p: TypeRendererEventArgMap[T]) => void) {
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

  trigger<T extends keyof TypeRendererEventArgMap >(eventKey: T, arg: TypeRendererEventArgMap[T]) {
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

  has<T extends keyof TypeRendererEventArgMap> (name: string) {
    if (this._listeners.has(name)) {
      const list: ((p: TypeRendererEventArgMap[T]) => void)[] | undefined = this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }

}