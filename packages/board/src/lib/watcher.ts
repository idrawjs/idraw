import type { Point, BoardWatcherEventMap, ViewContent, Data, Element, ElementType } from '@idraw/types';
import { EventEmitter } from '@idraw/util';

type WatcherOptions = { viewContent: ViewContent };

export class BoardWatcher extends EventEmitter<BoardWatcherEventMap> {
  private _opts: WatcherOptions;
  constructor(opts: WatcherOptions) {
    super();
    this._opts = opts;
    this._init();
  }

  private _init() {
    const boardCanvas = this._opts.viewContent.boardContext.canvas;
    boardCanvas.addEventListener('mousemove', (e: MouseEvent) => {
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('hover', { point });
    });
    boardCanvas.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('pointStart', { point });
    });
    boardCanvas.addEventListener('mousemove', (e: MouseEvent) => {
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('pointMove', { point });
    });
    boardCanvas.addEventListener('mouseup', (e: MouseEvent) => {
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('pointEnd', { point });
    });
    boardCanvas.addEventListener('mouseleave', (e: MouseEvent) => {
      e.preventDefault();
      const point = this._getPoint(e);
      this.trigger('pointLeave', { point });
    });
    boardCanvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      if (this.has('wheelX') && (e.deltaX > 0 || e.deltaX < 0)) {
        this.trigger('wheelX', { deltaX: e.deltaX });
      }
      if (this.has('wheelY') && (e.deltaY > 0 || e.deltaY < 0)) {
        this.trigger('wheelY', { deltaY: e.deltaY });
      }
    });
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
