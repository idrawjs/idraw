import { TypePoint } from '@idraw/types';

interface TypeWatcher {
  onMove(callback: TypeWatchCallback): void,
  onMoveEnd(callback: TypeWatchCallback): void,
  onMoveEnd(callback: TypeWatchCallback): void,
}


type TypeWatchCallback = (p: TypePoint) => void

export class Watcher implements TypeWatcher {

  private _canvas: HTMLCanvasElement;
  private _isPainting: boolean = false;
  private _onMove?: TypeWatchCallback;
  private _onMoveStart?: TypeWatchCallback;
  private _onMoveEnd?: TypeWatchCallback;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._isPainting = false;
    this._initEvent();
  }

  onMove(callback: TypeWatchCallback) {
    this._onMove = callback;
  }

  onMoveEnd(callback: TypeWatchCallback) {
    this._onMoveEnd = callback;
  }

  onMoveStart(callback: TypeWatchCallback) {
    this._onMoveStart = callback;
  }

  _initEvent() {
    const canvas = this._canvas;
    canvas.addEventListener('mousedown', this._listenStart.bind(this));
    canvas.addEventListener('mousemove', this._listenMove.bind(this));
    canvas.addEventListener('mouseup', this._listenEnd.bind(this));

    canvas.addEventListener('touchstart', this._listenStart.bind(this));
    canvas.addEventListener('touchmove', this._listenMove.bind(this));
    canvas.addEventListener('touchend', this._listenEnd.bind(this));

    const mouseupEvent = new MouseEvent('mouseup');
    document.querySelector('body')?.addEventListener('mousemove', (e) => {
      // @ts-ignore
      if (e && e.path && e.path[0] !== canvas) {
        if (this._isPainting === true) {
          canvas.dispatchEvent(mouseupEvent);
        }
      }
    }, false)
  }

  _listenStart(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    this._isPainting = true;
    if (typeof this._onMoveStart === 'function') {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._onMoveStart(p);
      }
    }
  }
  
  _listenMove(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this._isPainting === true) {
      if (typeof this._onMove === 'function') {
        const p = this._getPosition(e);
        if (this._isVaildPoint(p)) {
          this._onMove(p);
        }
      }
    }
  }
  
  _listenEnd(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    this._isPainting = false;
    if (typeof this._onMoveEnd === 'function') {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._onMoveEnd(p);
      }
    }
  }

  _getPosition(e: MouseEvent|TouchEvent) {
    const canvas = this._canvas;
    let x = 0;
    let y = 0;

    if (e instanceof TouchEvent) {
      const touch: Touch = e.touches[0];
      if (touch) {
        x = touch.clientX;
        y = touch.clientY;
      }
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    const p = {
      x: x - canvas.getBoundingClientRect().left,
      y: y - canvas.getBoundingClientRect().top,
      t: Date.now(),
    };
    return p;
  }

  private _isVaildPoint(p: TypePoint) {
    return ( p.x > 0 && p.y > 0)
  }
  
}
