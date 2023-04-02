/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Point, IDrawContext } from '@idraw/types';
import { BoardEvent, TypeBoardEventArgMap } from './event';
import { TempData } from './watcher-temp';

// const { throttle } = util.time;

// const isInIframe = window.self === window.top;

export class ScreenWatcher {
  private _canvas: HTMLCanvasElement;
  private _isMoving = false;
  // private _onMove?: TypeWatchCallback;
  // private _onMoveStart?: TypeWatchCallback;
  // private _onMoveEnd?: TypeWatchCallback;
  private _event: BoardEvent;
  private _temp: TempData = new TempData();
  private _container: HTMLElement | Window = window;
  // private _ctx: IDrawContext;

  constructor(canvas: HTMLCanvasElement, ctx: IDrawContext) {
    this._canvas = canvas;
    this._isMoving = false;
    this._initEvent();
    this._event = new BoardEvent();
    // this._ctx = ctx;
  }

  setStatusMap(statusMap: {
    canScrollYPrev: boolean;
    canScrollYNext: boolean;
    canScrollXPrev: boolean;
    canScrollXNext: boolean;
  }) {
    this._temp.set('statusMap', statusMap);
  }

  on<T extends keyof TypeBoardEventArgMap>(
    name: T,
    callback: (p: TypeBoardEventArgMap[T]) => void
  ): void {
    this._event.on(name, callback);
  }

  off<T extends keyof TypeBoardEventArgMap>(
    name: T,
    callback: (p: TypeBoardEventArgMap[T]) => void
  ): void {
    this._event.off(name, callback);
  }

  _initEvent(): void {
    const canvas = this._canvas;
    const container = this._container;
    // container.addEventListener('mousemove', this._listenWindowHover.bind(this), false);
    // container.addEventListener('mousedown', this._listenWindowMoveStart.bind(this), false);
    container.addEventListener(
      'mousemove',
      this._listenWindowMove.bind(this),
      false
    );
    container.addEventListener(
      'mouseup',
      this._listenWindowMoveEnd.bind(this),
      false
    );

    canvas.addEventListener('mousemove', this._listenHover.bind(this), false);
    canvas.addEventListener(
      'mousedown',
      this._listenMoveStart.bind(this),
      false
    );
    canvas.addEventListener('mousemove', this._listenMove.bind(this), false);
    canvas.addEventListener('mouseup', this._listenMoveEnd.bind(this), false);

    canvas.addEventListener('click', this._listenCanvasClick.bind(this), false);
    canvas.addEventListener('wheel', this._listenCanvasWheel.bind(this), false);
    canvas.addEventListener(
      'mousedown',
      this._listenCanvasMoveStart.bind(this),
      true
    );
    canvas.addEventListener(
      'mouseup',
      this._listenCanvasMoveEnd.bind(this),
      true
    );
    canvas.addEventListener(
      'mouseover',
      this._listenCanvasMoveOver.bind(this),
      true
    );
    canvas.addEventListener(
      'mouseleave',
      this._listenCanvasMoveLeave.bind(this),
      true
    );
    this._initParentEvent();

    // container.addEventListener('touchstart', this._listenMoveStart.bind(this), true);
    // container.addEventListener('touchmove', this._listenMove.bind(this), true);
    // container.addEventListener('touchend', this._listenMoveEnd.bind(this), true);
  }

  _initParentEvent() {
    try {
      let target = window;
      const targetOrigin = target.origin;
      while (target.self !== target.top) {
        // If in iframe
        if (target.self !== target.parent) {
          // If in same origin
          if (target.origin === targetOrigin) {
            // window.parent.window.addEventListener(
            //   'mousemove',
            //   throttle(this._listSameOriginParentWindow.bind(this), 16),
            //   false);
            target.parent.window.addEventListener(
              'mousemove',
              this._listSameOriginParentWindow.bind(this),
              false
            );
          }
        }
        // @ts-ignore
        target = target.parent;
        if (!target) {
          break;
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }

  _listenHover(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    const p = this._getPosition(e);
    if (this._isVaildPoint(p)) {
      if (this._event.has('hover')) {
        this._event.trigger('hover', p);
      }
    }
    this._isMoving = true;
  }

  // _listenLeave(e: MouseEvent|TouchEvent): void {
  //   e.preventDefault();
  //   if (this._event.has('leave')) {
  //     this._event.trigger('leave', undefined);
  //   }
  // }

  _listenMoveStart(e: MouseEvent | TouchEvent): void {
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

  _listenMove(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (this._event.has('move') && this._isMoving === true) {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._event.trigger('move', p);
      }
    }
  }

  _listenMoveEnd(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    if (this._event.has('moveEnd')) {
      const p = this._getPosition(e);
      if (this._isVaildPoint(p)) {
        this._event.trigger('moveEnd', p);
      }
    }
    this._isMoving = false;
  }

  _listSameOriginParentWindow() {
    if (this._temp.get('isHoverCanvas')) {
      if (this._event.has('leave')) {
        this._event.trigger('leave', undefined);
      }
    }
    if (this._temp.get('isDragCanvas')) {
      if (this._event.has('moveEnd')) {
        this._event.trigger('moveEnd', { x: NaN, y: NaN });
      }
    }
    this._isMoving = false;
    this._temp.set('isDragCanvas', false);
    this._temp.set('isHoverCanvas', false);
  }

  _listenCanvasMoveStart() {
    if (this._temp.get('isHoverCanvas')) {
      this._temp.set('isDragCanvas', true);
    }
  }

  _listenCanvasMoveEnd() {
    this._temp.set('isDragCanvas', false);
  }

  _listenCanvasMoveOver() {
    this._temp.set('isHoverCanvas', true);
  }

  _listenCanvasMoveLeave() {
    this._temp.set('isHoverCanvas', false);
    if (this._event.has('leave')) {
      this._event.trigger('leave', undefined);
    }
  }

  // _listenWindowHover(e: MouseEvent|TouchEvent|Event): void {
  //   if (this._temp.get('isDragCanvas')) {
  //     return;
  //   }
  //   e.preventDefault();
  //   const p = this._getPosition(e as MouseEvent|TouchEvent);
  //   if (this._isVaildPoint(p)) {
  //     if (this._event.has('hover')) {
  //       this._event.trigger('hover', p);
  //     }
  //   }
  //   this._isMoving = true;
  // }

  // _listenWindowMoveStart(e: MouseEvent|TouchEvent|Event): void {
  //   if (this._temp.get('isHoverCanvas') !== true) {
  //     return;
  //   }
  //   e.preventDefault();
  //   const p = this._getPosition(e as MouseEvent|TouchEvent);
  //   if (this._isVaildPoint(p)) {
  //     if (this._event.has('point')) {
  //       this._event.trigger('point', p);
  //     }
  //     if (this._event.has('moveStart')) {
  //       this._event.trigger('moveStart', p);
  //     }
  //   }
  //   this._isMoving = true;
  // }

  _listenWindowMove(e: MouseEvent | TouchEvent | Event): void {
    if (this._temp.get('isDragCanvas') !== true) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (this._event.has('move') && this._isMoving === true) {
      const p = this._getPosition(e as MouseEvent | TouchEvent);
      if (this._isVaildPoint(p)) {
        this._event.trigger('move', p);
      }
    }
  }

  _listenWindowMoveEnd(e: MouseEvent | TouchEvent | Event): void {
    if (!this._temp.get('isDragCanvas') === true) {
      return;
    }
    e.preventDefault();
    if (this._event.has('moveEnd')) {
      const p = this._getPosition(e as MouseEvent | TouchEvent);
      if (this._isVaildPoint(p)) {
        this._event.trigger('moveEnd', p);
      }
    }
    this._temp.set('isDragCanvas', false);
    this._isMoving = false;
  }

  _listenCanvasWheel(e: WheelEvent) {
    // e.preventDefault();
    // const { scrollX, scrollY } = this._ctx.getTransform();
    // const { width, height } = this._ctx.getSize();
    if (this._event.has('wheelX') && (e.deltaX > 0 || e.deltaX < 0)) {
      this._event.trigger('wheelX', e.deltaX);
    }
    if (this._event.has('wheelY') && (e.deltaY > 0 || e.deltaY < 0)) {
      this._event.trigger('wheelY', e.deltaY);
    }
    const { canScrollYNext, canScrollYPrev } = this._temp.get('statusMap');

    if (e.deltaX > 0 && e.deltaX < 0) {
      e.preventDefault();
    } else if (e.deltaY > 0 && canScrollYNext === true) {
      e.preventDefault();
    } else if (e.deltaY < 0 && canScrollYPrev === true) {
      e.preventDefault();
    }
  }

  _listenCanvasClick(e: MouseEvent | TouchEvent | Event) {
    e.preventDefault();
    const maxLimitTime = 500;
    const p = this._getPosition(e as MouseEvent | TouchEvent);
    const t = Date.now();
    if (this._isVaildPoint(p)) {
      const preClickPoint = this._temp.get('prevClickPoint');
      if (
        preClickPoint &&
        t - preClickPoint.t <= maxLimitTime &&
        Math.abs(preClickPoint.x - p.x) <= 5 &&
        Math.abs(preClickPoint.y - p.y) <= 5
      ) {
        if (this._event.has('doubleClick')) {
          this._event.trigger('doubleClick', { x: p.x, y: p.y });
        }
      } else {
        this._temp.set('prevClickPoint', { x: p.x, y: p.y, t });
      }
    }
  }

  _getPosition(e: MouseEvent | TouchEvent): Point {
    const canvas = this._canvas;
    let x = 0;
    let y = 0;

    // @ts-ignore
    if (e && e.touches && e.touches.length > 0) {
      // @ts-ignore
      const touch: Touch = e.touches[0];
      if (touch) {
        x = touch.clientX;
        y = touch.clientY;
      }
    } else {
      // @ts-ignore
      x = e.clientX;
      // @ts-ignore
      y = e.clientY;
    }

    const p = {
      x: x - canvas.getBoundingClientRect().left,
      y: y - canvas.getBoundingClientRect().top,
      t: Date.now()
    };
    return p;
  }

  private _isVaildPoint(p: Point): boolean {
    return isAvailableNum(p.x) && isAvailableNum(p.y);
  }
}

function isAvailableNum(num: any): boolean {
  return num > 0 || num < 0 || num === 0;
}
