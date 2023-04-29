import type { Point, BoardWatcherEventMap, ViewContent, Data, Element, ElementType, BoardWatcherOptions, BoardWatcherStore } from '@idraw/types';
import { EventEmitter, Store } from '@idraw/util';

function isBoardAvailableNum(num: any): boolean {
  return num > 0 || num < 0 || num === 0;
}

export class BoardWatcher extends EventEmitter<BoardWatcherEventMap> {
  private _opts: BoardWatcherOptions;
  private _store: Store<BoardWatcherStore>;
  constructor(opts: BoardWatcherOptions) {
    super();
    const store = new Store<BoardWatcherStore>({ defaultStorage: { hasPointDown: true } });
    this._store = store;
    this._opts = opts;
    this._init();
  }

  private _init() {
    const container = window;
    container.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this._isInTarget(e)) {
        return;
      }
      if (this._store.get('hasPointDown') === true) {
        return;
      }
      e.preventDefault();
      const point = this._getPoint(e);
      if (!this._isVaildPoint(point)) {
        return;
      }
      this.trigger('hover', { point });
    });
    container.addEventListener('mousedown', (e: MouseEvent) => {
      if (!this._isInTarget(e)) {
        return;
      }
      e.preventDefault();
      this._store.set('hasPointDown', true);
      const point = this._getPoint(e);
      if (!this._isVaildPoint(point)) {
        return;
      }
      this.trigger('pointStart', { point });
    });
    container.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this._isInTarget(e)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const point = this._getPoint(e);
      if (!this._isVaildPoint(point)) {
        if (this._store.get('hasPointDown')) {
          this.trigger('pointLeave', { point });
          this._store.set('hasPointDown', false);
        }
        return;
      }
      this.trigger('pointMove', { point });
    });
    container.addEventListener('mouseup', (e: MouseEvent) => {
      if (!this._isInTarget(e)) {
        return;
      }
      e.preventDefault();
      this._store.set('hasPointDown', false);
      const point = this._getPoint(e);
      this.trigger('pointEnd', { point });
    });
    container.addEventListener('mouseleave', (e: MouseEvent) => {
      if (!this._isInTarget(e)) {
        return;
      }
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('pointLeave', { point });
    });
    container.addEventListener('wheel', (e: WheelEvent) => {
      // e.preventDefault();
      if (!this._isInTarget(e)) {
        return;
      }
      const point = this._getPoint(e);
      if (!this._isVaildPoint(point)) {
        return;
      }
      if (this.has('wheelX') && (e.deltaX > 0 || e.deltaX < 0)) {
        this.trigger('wheelX', { deltaX: e.deltaX, point });
      }
      if (this.has('wheelY') && (e.deltaY > 0 || e.deltaY < 0)) {
        this.trigger('wheelY', { deltaY: e.deltaY, point });
      }
    });
  }

  private _isInTarget(e: MouseEvent | WheelEvent) {
    return e.target === this._opts.viewContent.boardContext.canvas;
  }

  private _getPoint(e: MouseEvent): Point {
    const boardCanvas = this._opts.viewContent.boardContext.canvas;
    const rect = boardCanvas.getBoundingClientRect();
    const p: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: Date.now()
    };
    return p;
  }

  private _isVaildPoint(p: Point): boolean {
    const viewSize = this._opts.sharer.getActiveViewSizeInfo();
    const { width, height } = viewSize;
    if (isBoardAvailableNum(p.x) && isBoardAvailableNum(p.y) && p.x <= width && p.y <= height) {
      return true;
    }
    return false;
  }
}

interface PointResult {
  index: number;
  element: Element<ElementType> | null;
}

export function getPointResult(p: Point, data: Data): PointResult {
  const result: PointResult = {
    index: -1,
    element: null
  };
  for (let i = 0; i < data.elements.length; i++) {
    const elem = data.elements[i];
    if (p.x >= elem.x && p.x <= elem.x + elem.w && p.y >= elem.y && p.y <= elem.y + elem.h) {
      result.index = i;
      result.element = elem;
      break;
    }
  }
  return result;
}
