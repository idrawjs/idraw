import type { UtilEventEmitter } from '@idraw/types';

export class EventEmitter<T extends Record<string, any>> implements UtilEventEmitter<T> {
  private _listeners: Map<keyof T, ((e: any) => void)[]>;

  constructor() {
    this._listeners = new Map<keyof T, ((e: any) => void)[]>();
  }

  on<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks: Array<(e: T[K]) => void> = this._listeners.get(eventKey) || [];
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }

  off<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void) {
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

  trigger<K extends keyof T>(eventKey: K, e: T[K]) {
    const callbacks = this._listeners.get(eventKey);
    if (Array.isArray(callbacks)) {
      callbacks.forEach((cb) => {
        cb(e);
      });
      return true;
    } else {
      return false;
    }
  }

  has<K extends keyof T>(name: K | string): boolean {
    if (this._listeners.has(name)) {
      const list: ((p: T[K]) => void)[] | undefined = this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }
}
