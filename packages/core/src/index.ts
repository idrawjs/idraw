import type { Data, PointSize, CoreOptions, BoardMiddleware, ViewSizeInfo, CoreEventMap, ViewScaleInfo, LoadItemMap, ModifyOptions } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContent, validateElements } from '@idraw/util';
import { Cursor } from './lib/cursor';
export { coreEventKeys } from './config';
export type { CoreEventKeys } from './config';

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareScaler } from './middleware/scaler';
export { MiddlewareRuler } from './middleware/ruler';
export { MiddlewareTextEditor } from './middleware/text-editor';
export { MiddlewareDragger } from './middleware/dragger';
export { MiddlewareInfo } from './middleware/info';
export { MiddlewareLayoutSelector } from './middleware/layout-selector';
export { MiddlewarePointer } from './middleware/pointer';

export class Core<E extends CoreEventMap = CoreEventMap> {
  #board: Board<E>;
  // #opts: CoreOptions;
  #canvas: HTMLCanvasElement;
  #container: HTMLDivElement;

  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height, createCustomContext2D } = opts;

    // this.#opts = opts;
    this.#container = container;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('tabindex', '0');
    this.#canvas = canvas;
    this.#initContainer();
    container.appendChild(canvas);

    const boardContent = createBoardContent(canvas, { width, height, devicePixelRatio, offscreen: true, createCustomContext2D });
    const board = new Board<E>({ boardContent, container });
    const sharer = board.getSharer();
    sharer.setActiveViewSizeInfo({
      width,
      height,
      devicePixelRatio,
      contextWidth: width,
      contextHeight: height
    });
    this.#board = board;
    this.resize(sharer.getActiveViewSizeInfo());
    const eventHub = board.getEventHub();
    new Cursor(container, {
      eventHub
    });
  }

  isDestroyed() {
    return this.#board.isDestroyed();
  }

  destroy() {
    this.#board.destroy();
    this.#canvas.remove();
  }

  #initContainer() {
    const container = this.#container;
    container.style.position = 'relative';
  }

  use<C extends any = any>(middleware: BoardMiddleware<any, any, any>, config?: C) {
    this.#board.use<C>(middleware, config);
  }

  disuse(middleware: BoardMiddleware<any, any, any>) {
    this.#board.disuse(middleware);
  }

  resetMiddlewareConfig<C extends any = any>(middleware: BoardMiddleware<any, any, any>, config?: Partial<C>) {
    this.#board.resetMiddlewareConfig(middleware, config);
  }

  setData(
    data: Data,
    opts?: {
      modifiedOptions?: ModifyOptions;
    }
  ) {
    validateElements(data?.elements || []);
    this.#board.setData(data, opts);
  }

  getData(): Data | null {
    return this.#board.getData();
  }

  scale(opts: { scale: number; point: PointSize }) {
    this.#board.scale(opts);
    const viewer = this.#board.getViewer();
    viewer.drawFrame();
  }

  resize(newViewSize: Partial<ViewSizeInfo>) {
    const board = this.#board;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    board.resize({
      ...viewSizeInfo,
      ...newViewSize
    });
  }

  clear() {
    this.#board.clear();
  }

  on<T extends keyof E>(name: T, callback: (e: E[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.on(name, callback);
  }

  off<T extends keyof E>(name: T, callback: (e: E[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.off(name, callback);
  }

  trigger<T extends keyof E>(name: T, e: E[T]) {
    const eventHub = this.#board.getEventHub();
    eventHub.trigger(name, e);
  }

  getViewInfo(): { viewSizeInfo: ViewSizeInfo; viewScaleInfo: ViewScaleInfo } {
    const board = this.#board;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = sharer.getActiveViewScaleInfo();
    return {
      viewSizeInfo,
      viewScaleInfo
    };
  }

  refresh() {
    this.#board.getViewer().drawFrame();
  }

  setViewScale(opts: { scale: number; offsetX: number; offsetY: number }) {
    this.#board.updateViewScaleInfo(opts);
  }

  getLoadItemMap(): LoadItemMap {
    return this.#board.getRenderer().getLoadItemMap();
  }

  onBoardWatcherEvents() {
    this.#board.onWatcherEvents();
  }

  offBoardWatcherEvents() {
    this.#board.offWatcherEvents();
  }
}
