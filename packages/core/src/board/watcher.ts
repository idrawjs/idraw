import type {
  ActionPoint,
  BoardWatcherEventMap,
  Data,
  Material,
  BoardWatcherOptions,
  BoardWatcherStore,
} from '@idraw/types';
import { EventEmitter, Store, ATTR_VALID_WATCH, getHTMLElementRectInPage } from '@idraw/util';

function isBoardAvailableNum(num: any): boolean {
  return num > 0 || num < 0 || num === 0;
}

export class BoardWatcher extends EventEmitter<BoardWatcherEventMap> {
  #opts: BoardWatcherOptions;
  #store: Store<BoardWatcherStore>;
  #hasDestroyed: boolean = false;
  constructor(opts: BoardWatcherOptions) {
    super();
    const store = new Store<BoardWatcherStore>({
      defaultStorage: { hasPointDown: false, inCanvas: true },
    });
    this.#store = store;
    this.#opts = opts;
    this.#init();
  }

  #init() {
    this.onEvents();
  }

  onEvents() {
    if (this.#opts.disabled === true) {
      return;
    }
    if (this.#hasDestroyed) {
      return;
    }
    // const canvas = this.#opts.boardContent.boardContext.canvas;
    const container = window;
    const innerContainer: HTMLElement = this.#opts?.container || this.#opts.boardContent.boardContext.canvas;

    container.addEventListener('mousemove', this.#onPointMove);
    container.addEventListener('mouseup', this.#onPointEnd);

    innerContainer.addEventListener('mousemove', this.#onHover);
    innerContainer.addEventListener('mousedown', this.#onPointStart);
    innerContainer.addEventListener('wheel', this.#onWheel, { passive: false });
    innerContainer.addEventListener('click', this.#onClick);
    innerContainer.addEventListener('contextmenu', this.#onContextMenu);
    innerContainer.addEventListener('dblclick', this.#doubleClick);
  }

  offEvents() {
    if (this.#opts.disabled === true) {
      return;
    }
    const container = window;
    const innerContainer: HTMLElement = this.#opts?.container || this.#getBoardCanvas();

    container.removeEventListener('mousemove', this.#onPointMove);
    container.removeEventListener('mouseup', this.#onPointEnd);
    innerContainer.removeEventListener('mousemove', this.#onHover);
    innerContainer.removeEventListener('mousedown', this.#onPointStart);
    innerContainer.removeEventListener('wheel', this.#onWheel);
    innerContainer.removeEventListener('click', this.#onClick);
    innerContainer.removeEventListener('contextmenu', this.#onContextMenu);
    innerContainer.removeEventListener('dblclick', this.#doubleClick);
  }

  destroy() {
    this.offEvents();
    this.#store.destroy();
    this.#hasDestroyed = true;
  }

  #getBoardCanvas() {
    return this.#opts.boardContent.boardContext.canvas;
  }

  #onWheel = (e: WheelEvent) => {
    const nativeEvent = e;
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
      this.trigger('wheelScale', { deltaX, deltaY, point, nativeEvent });
    } else if (this.has('wheel')) {
      this.trigger('wheel', { deltaX, deltaY, point, nativeEvent });
    }
  };

  #onContextMenu = (e: MouseEvent) => {
    const nativeEvent = e;
    if (e.button !== 2) {
      return;
    }
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.trigger('contextMenu', { point, nativeEvent });
  };

  #onClick = (e: MouseEvent) => {
    const nativeEvent = e;
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.trigger('click', { point, nativeEvent });
  };

  #doubleClick = (e: MouseEvent) => {
    const nativeEvent = e;
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.trigger('doubleClick', { point, nativeEvent });
  };

  #onPointLeave = (e: MouseEvent) => {
    const nativeEvent = e;
    this.#store.set('hasPointDown', false);
    e.preventDefault();
    const point = this.#getPoint(e);
    this.trigger('pointLeave', { point, nativeEvent });
  };

  #onPointEnd = (e: MouseEvent) => {
    const nativeEvent = e;
    this.#store.set('hasPointDown', false);
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);
    this.trigger('pointEnd', { point, nativeEvent });
  };

  #onPointMove = (e: MouseEvent) => {
    const nativeEvent = e;
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      if (this.#store.get('hasPointDown')) {
        this.trigger('pointLeave', { point, nativeEvent });
        this.#store.set('hasPointDown', false);
      }
      return;
    }
    if (this.#store.get('hasPointDown') !== true) {
      return;
    }
    this.trigger('pointMove', { point, nativeEvent });
  };

  #onPointStart = (e: MouseEvent) => {
    const nativeEvent = e;
    // mouse-left-click:  button = 0
    // mouse-right-click: button = 2
    // mouse-scroll button = 1
    if (e.button !== 0) {
      return;
    }
    if (!this.#isInTarget(e)) {
      return;
    }
    e.preventDefault();
    const point = this.#getPoint(e);

    if (!this.#isVaildPoint(point)) {
      return;
    }

    this.#store.set('hasPointDown', true);
    this.trigger('pointStart', { point, nativeEvent });
  };

  #onHover = (e: MouseEvent) => {
    const nativeEvent = e;
    if (!this.#isInTarget(e)) {
      if (this.#store.get('inCanvas') === true) {
        this.#store.set('inCanvas', false);
        this.#onPointLeave(e);
      }
      return;
    }
    this.#store.set('inCanvas', true);
    // if (!this.#store.get('hasPointDown')) {
    //   return;
    // }
    e.preventDefault();
    const point = this.#getPoint(e);
    if (!this.#isVaildPoint(point)) {
      return;
    }
    this.trigger('hover', { point, nativeEvent });
  };

  #isInTarget(e: MouseEvent | WheelEvent) {
    const $target = e.target as HTMLElement;
    if ($target.getAttribute(ATTR_VALID_WATCH) === 'true') {
      return true;
    }
    if ($target !== this.#getBoardCanvas()) {
      return false;
    }

    const rect = getHTMLElementRectInPage(this.#opts.boardContent.boardContext.canvas);
    return (
      e.pageX >= rect.pageX &&
      e.pageX <= rect.pageX + rect.width &&
      e.pageY >= rect.pageY &&
      e.pageY <= rect.pageY + rect.height
    );
  }

  #getPoint(e: MouseEvent): ActionPoint {
    const boardCanvas = this.#opts.boardContent.boardContext.canvas;
    const rect = boardCanvas.getBoundingClientRect();
    const p: ActionPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: Date.now(),
    };
    return p;
  }

  #isVaildPoint(p: ActionPoint): boolean {
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
  material: Material | null;
}

export function getPointResult(p: ActionPoint, data: Data): PointResult {
  const result: PointResult = {
    index: -1,
    material: null,
  };
  for (let i = 0; i < data.materials.length; i++) {
    const mtrl = data.materials[i];
    if (p.x >= mtrl.x && p.x <= mtrl.x + mtrl.width && p.y >= mtrl.y && p.y <= mtrl.y + mtrl.height) {
      result.index = i;
      result.material = mtrl;
      break;
    }
  }
  return result;
}
