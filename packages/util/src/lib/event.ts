import type { UtilEventEmitter } from '@idraw/types';

export class EventEmitter<T extends Record<string, any>> implements UtilEventEmitter<T> {
  #listeners: Map<keyof T, ((e: any) => void)[]>;

  constructor() {
    this.#listeners = new Map<keyof T, ((e: any) => void)[]>();
  }

  on<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void) {
    if (this.#listeners.has(eventKey)) {
      const callbacks: Array<(e: T[K]) => void> = this.#listeners.get(eventKey) || [];
      callbacks?.push(callback);
      this.#listeners.set(eventKey, callbacks);
    } else {
      this.#listeners.set(eventKey, [callback]);
    }
  }

  off<K extends keyof T>(eventKey: K, callback: (e: T[K]) => void) {
    if (this.#listeners.has(eventKey)) {
      const callbacks = this.#listeners.get(eventKey);
      if (Array.isArray(callbacks)) {
        for (let i = 0; i < callbacks?.length; i++) {
          if (callbacks[i] === callback) {
            callbacks.splice(i, 1);
            break;
          }
        }
      }
      this.#listeners.set(eventKey, callbacks || []);
    }
  }

  trigger<K extends keyof T>(eventKey: K, e?: T[K]) {
    const callbacks = this.#listeners.get(eventKey);
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
    if (this.#listeners.has(name)) {
      const list: ((p: T[K]) => void)[] | undefined = this.#listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }

  destroy() {
    this.#listeners.clear();
  }
}
