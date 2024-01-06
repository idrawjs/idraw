import type { Point, BoardWatcherEventMap, Data, Element, ElementType, BoardWatcherOptions, BoardWatcherStore } from '@idraw/types';
import { EventEmitter, Store } from '@idraw/util';

function isBoardAvailableNum(num: any): boolean {
  return num > 0 || num < 0 || num === 0;
}

export class BoardWatcher extends EventEmitter<BoardWatcherEventMap> {
  #opts: BoardWatcherOptions;
  #store: Store<BoardWatcherStore>;
  constructor(opts: BoardWatcherOptions) {
    super();
    const store = new Store<BoardWatcherStore>({ defaultStorage: { hasPointDown: false, prevClickPoint: null } });
    this.#store = store;
    this.#opts = opts;
    this.#init();
  }

  #init() {
    const container = window;
    container.addEventListener('mousemove', this.#onHover);
    container.addEventListener('mousedown', this.#onPointStart);
    container.addEventListener('mousemove', this.#onPointMove);
    container.addEventListener('mouseup', this.#onPointEnd);
    container.addEventListener('mouseleave', this.#onPointLeave);
    container.addEventListener('wheel', this.#onWheel, { passive: false });
    container.addEventListener('click', this.#onClick);
    container.addEventListener('contextmenu', this.#onContextMenu);
  }

  destroy() {
    const container = window;
    container.removeEventListener('mousemove', this.#onHover);
    container.removeEventListener('mousedown', this.#onPointStart);
    container.removeEventListener('mousemove', this.#onPointMove);
    container.removeEventListener('mouseup', this.#onPointEnd);
    container.removeEventListener('mouseleave', this.#onPointLeave);
    container.removeEventListener('wheel', this.#onWheel);
    container.removeEventListener('click', this.#onClick);
    container.removeEventListener('contextmenu', this.#onContextMenu);
    this.destroy();
  }

  #onWheel = (e: WheelEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.deltaX > 0 || e.deltaX < 0 ? e.deltaX : 0;
    const deltaY = e.deltaY > 0 || e.deltaY < 0 ? e.deltaY : 0;

    if (e.ctrlKey === true && this.has('wheelScale')) {
      this.trigger('wheelScale', { deltaX, deltaY, point });
    } else if (this.has('wheel')) {
      this.trigger('wheel', { deltaX, deltaY, point });
    }
  };

  #onContextMenu = (e: MouseEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    // TODO
  };

  #onClick = (e: MouseEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    const maxLimitTime = 500;
    const t = Date.now();
    const preClickPoint = this.#store.get('prevClickPoint');
    if (preClickPoint && t - preClickPoint.t <= maxLimitTime && Math.abs(preClickPoint.x - point.x) <= 5 && Math.abs(preClickPoint.y - point.y) <= 5) {
      this.trigger('doubleClick', { point });
    } else {
      this.#store.set('prevClickPoint', point);
    }
  };

  #onPointLeave = (e: MouseEvent) => {
    this.#store.set('hasPointDown', false);
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    this.trigger('pointLeave', { point });
  };

  #onPointEnd = (e: MouseEvent) => {
    this.#store.set('hasPointDown', false);
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    this.trigger('pointEnd', { point });
  };

  #onPointMove = (e: MouseEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      if (this.#store.get('hasPointDown')) {
        this.trigger('pointLeave', { point });
        this.#store.set('hasPointDown', false);
      }
      return;
    }
    if (this.#store.get('hasPointDown') !== true) {
      return;
    }
    this.trigger('pointMove', { point });
  };

  #onPointStart = (e: MouseEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.#store.set('hasPointDown', true);
    this.trigger('pointStart', { point });
  };

  #onHover = (e: MouseEvent) => {
    if (!this.#isInTarget(e)) {
      return;
    }
    // if (!this.#store.get('hasPointDown')) {
    //   return;
    // }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.trigger('hover', { point });
  };

  #isInTarget(e: MouseEvent | WheelEvent) {
    return e.target === this.#opts.boardContent.boardContext.canvas;
  }

  #getPoint(e: MouseEvent): Point {
    const boardCanvas = this.#opts.boardContent.boardContext.canvas;
    const rect = boardCanvas.getBoundingClientRect();
    const p: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: Date.now()
    };
    return p;
  }

  #isVaildPoint(p: Point): boolean {
    const viewSize = this.#opts.sharer.getActiveViewSizeInfo();
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
