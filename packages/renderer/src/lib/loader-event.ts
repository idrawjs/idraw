import { DataElement, DataElemDesc } from '@idraw/types';

export type TypeLoadDataItem = {
  uuid: string;
  type: 'image' | 'svg' | 'html';
  status: 'null' | 'loaded' | 'fail';
  content: null | HTMLImageElement | HTMLCanvasElement;
  elemW: number;
  elemH: number;
  source: string;
  element: DataElement<keyof DataElemDesc>;
  error?: any;
};

export type TypeLoadData = {
  [uuid: string]: TypeLoadDataItem;
};

export type TypeLoaderEventArgMap = {
  complete: void;
  load: TypeLoadData[string];
  error: TypeLoadData[string];
};

export interface TypeLoaderEvent {
  on<T extends keyof TypeLoaderEventArgMap>(
    key: T,
    callback: (p: TypeLoaderEventArgMap[T]) => void
  ): void;
  off<T extends keyof TypeLoaderEventArgMap>(
    key: T,
    callback: (p: TypeLoaderEventArgMap[T]) => void
  ): void;
  trigger<T extends keyof TypeLoaderEventArgMap>(
    key: T,
    p: TypeLoaderEventArgMap[T]
  ): void;
}

export class LoaderEvent implements TypeLoaderEvent {
  private _listeners: Map<string, ((p: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
  }

  on<T extends keyof TypeLoaderEventArgMap>(
    eventKey: T,
    callback: (p: TypeLoaderEventArgMap[T]) => void
  ) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks || []);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }

  off<T extends keyof TypeLoaderEventArgMap>(
    eventKey: T,
    callback: (p: TypeLoaderEventArgMap[T]) => void
  ) {
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

  trigger<T extends keyof TypeLoaderEventArgMap>(
    eventKey: T,
    arg: TypeLoaderEventArgMap[T]
  ) {
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

  has<T extends keyof TypeLoaderEventArgMap>(name: string) {
    if (this._listeners.has(name)) {
      const list: ((p: TypeLoaderEventArgMap[T]) => void)[] | undefined =
        this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }
}
