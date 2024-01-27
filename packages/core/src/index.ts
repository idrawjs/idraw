import type { Data, PointSize, CoreOptions, BoardMiddleware, ViewSizeInfo, CoreEvent, ViewScaleInfo, LoadItemMap } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContent, validateElements } from '@idraw/util';
import { Cursor } from './lib/cursor';

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector, middlewareEventSelect, middlewareEventSelectClear } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareScaler, middlewareEventScale } from './middleware/scaler';
export { MiddlewareRuler, middlewareEventRuler } from './middleware/ruler';
export { MiddlewareTextEditor, middlewareEventTextEdit } from './middleware/text-editor';
export { MiddlewareDragger } from './middleware/dragger';

export class Core<E extends CoreEvent = CoreEvent> {
  #board: Board<E>;
  // #opts: CoreOptions;
  #canvas: HTMLCanvasElement;
  #container: HTMLDivElement;

  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height, createCustomContext2D } = opts;

    // this.#opts = opts;
    this.#container = container;
    const canvas = document.createElement('canvas');
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

  destroy() {
    this.#board.destroy();
    this.#canvas.remove();
  }

  #initContainer() {
    const container = this.#container;
    container.style.position = 'relative';
  }

  use(middleware: BoardMiddleware<any, any>) {
    this.#board.use(middleware);
  }

  disuse(middleware: BoardMiddleware<any, any>) {
    this.#board.disuse(middleware);
  }

  setData(data: Data) {
    validateElements(data?.elements || []);
    this.#board.setData(data);
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
}
