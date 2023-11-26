import type { Data, PointSize, CoreOptions, BoardMiddleware, ViewSizeInfo, CoreEvent, ViewScaleInfo } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts, validateElements } from '@idraw/util';
import { Cursor } from './lib/cursor';

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector, middlewareEventSelect } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareScaler, middlewareEventScale } from './middleware/scaler';
export { MiddlewareRuler, middlewareEventRuler } from './middleware/ruler';
export { MiddlewareTextEditor, middlewareEventTextEdit } from './middleware/text-editor';

export class Core {
  #board: Board<CoreEvent>;
  // #opts: CoreOptions;
  // #canvas: HTMLCanvasElement;
  #container: HTMLDivElement;
  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height } = opts;

    // this.#opts = opts;
    // this.#canvas = canvas;
    this.#container = container;
    const canvas = document.createElement('canvas');
    this.#initContainer();
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewContent = createBoardContexts(ctx, { devicePixelRatio });
    const board = new Board<CoreEvent>({ viewContent, container });
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

  #initContainer() {
    const container = this.#container;
    container.style.position = 'relative';
  }

  use(middleware: BoardMiddleware<any, any>) {
    this.#board.use(middleware);
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

  on<T extends keyof CoreEvent>(name: T, callback: (e: CoreEvent[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.on(name, callback);
  }

  off<T extends keyof CoreEvent>(name: T, callback: (e: CoreEvent[T]) => void) {
    const eventHub = this.#board.getEventHub();
    eventHub.off(name, callback);
  }

  trigger<T extends keyof CoreEvent>(name: T, e: CoreEvent[T]) {
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
}
