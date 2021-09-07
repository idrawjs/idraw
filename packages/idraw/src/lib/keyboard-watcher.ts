

export type TypeKeyboardEventArgMap = {
  'keyboardCopy': void;
  'keyboardPaste': void;
  'keyboardCut': void;
  'keyboardDelete': void;
  'keyboardArrowRight': void;
  'keyboardArrowLeft': void;
  'keyboardArrowUp': void;
  'keyboardArrowDown': void;
}
 
export interface TypeKeyboardEvent {
  on<T extends keyof TypeKeyboardEventArgMap >(key: T, callback: (p: TypeKeyboardEventArgMap[T]) => void): void
  off<T extends keyof TypeKeyboardEventArgMap >(key: T, callback: (p: TypeKeyboardEventArgMap[T]) => void): void
  // trigger<T extends keyof TypeKeyboardEventArgMap >(key: T, p: TypeKeyboardEventArgMap[T]): void
}


export class KeyboardWatcher implements TypeKeyboardEvent {

  private _listeners: Map<string, ((p: any) => void)[]>;

  constructor() {
    this._listeners = new Map();
    this._initEvent();
  }

  private _initEvent() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'c') {
        this.trigger('keyboardCopy', undefined);
      } else if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'v') {
        this.trigger('keyboardPaste', undefined);
      } else if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'x') {
        this.trigger('keyboardCut', undefined);
      } else if (e.key === 'Backspace') {
        this.trigger('keyboardDelete', undefined);
      } else if (e.key === 'ArrowUp') {
        this.trigger('keyboardArrowUp', undefined);
      } else if (e.key === 'ArrowDown') {
        this.trigger('keyboardArrowDown', undefined);
      } else if (e.key === 'ArrowLeft') {
        this.trigger('keyboardArrowLeft', undefined);
      } else if (e.key === 'ArrowRight') {
        this.trigger('keyboardArrowRight', undefined);
      }
    });
  }

  on<T extends keyof TypeKeyboardEventArgMap >(eventKey: T, callback: (p: TypeKeyboardEventArgMap[T]) => void) {
    if (this._listeners.has(eventKey)) {
      const callbacks = this._listeners.get(eventKey);
      callbacks?.push(callback);
      this._listeners.set(eventKey, callbacks || []);
    } else {
      this._listeners.set(eventKey, [callback]);
    }
  }
  
  off<T extends keyof TypeKeyboardEventArgMap >(eventKey: T, callback: (p: TypeKeyboardEventArgMap[T]) => void) {
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

  trigger<T extends keyof TypeKeyboardEventArgMap >(eventKey: T, arg: TypeKeyboardEventArgMap[T]) {
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

  has<T extends keyof TypeKeyboardEventArgMap> (name: string) {
    if (this._listeners.has(name)) {
      const list: ((p: TypeKeyboardEventArgMap[T]) => void)[] | undefined = this._listeners.get(name);
      if (Array.isArray(list) && list.length > 0) {
        return true;
      }
    }
    return false;
  }

}
