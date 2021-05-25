import { TypePoint } from '@idraw/types';
import { BoardEvent, TypeBoardEventArgMap } from './event';


export class Watcher {

  private _canvas: HTMLCanvasElement;
  private _isMoving: boolean = false;
  // private _onMove?: TypeWatchCallback;
  // private _onMoveStart?: TypeWatchCallback;
  // private _onMoveEnd?: TypeWatchCallback;
  private _event: BoardEvent;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._isMoving = false;
    this._initEvent();
    this._event = new BoardEvent;
  }

  on<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._event.on(name, callback)
  }

  off<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._event.off(name, callback)
  }

  _initEvent() {
    const canvas = this._canvas;
    canvas.addEventListener('mousedown', this._listenMoveStart.bind(this));
    canvas.addEventListener('mousemove', this._listenMove.bind(this));
    canvas.addEventListener('mouseup', this._listenMoveEnd.bind(this));

    canvas.addEventListener('touchstart', this._listenMoveStart.bind(this));
    canvas.addEventListener('touchmove', this._listenMove.bind(this));
    canvas.addEventListener('touchend', this._listenMoveEnd.bind(this));

    const mouseupEvent = new MouseEvent('mouseup');
    document.querySelector('body')?.addEventListener('mousemove', (e) => {
      // @ts-ignore
      if (e && e.path && e.path[0] !== canvas) {
        canvas.dispatchEvent(mouseupEvent);
      }
    }, false)
  }

  _listenMoveStart(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    const p = this._getPosition(e);
    if (this._isVaildPoint(p)) {
      if (this._event.has('point')) {
        this._event.trigger('point', p);
      }
      if (this._event.has('moveStart')) {
        this._event.trigger('moveStart', p);
      }
    }
    this._isMoving = true;
  }
  
  _listenMove(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this._event.has('move') && this._isMoving === true) {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._event.trigger('move', p);
      }
    }
  }
  
  _listenMoveEnd(e: MouseEvent|TouchEvent) {
    e.preventDefault();
    if (this._event.has('moveEnd')) {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._event.trigger('moveEnd', p);
      }
    }
    this._isMoving = false;
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
