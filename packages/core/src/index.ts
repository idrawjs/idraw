import type { Data, PointSize, CoreOptions, BoardMiddleware, ViewSizeInfo, CoreEvent } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts, validateElements } from '@idraw/util';
import { Cursor } from './lib/cursor';

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareScaler } from './middleware/scaler';
export { MiddlewareRuler } from './middleware/ruler';

export class Core {
  private _board: Board<CoreEvent>;
  private _opts: CoreOptions;
  private _container: HTMLDivElement;
  private _canvas: HTMLCanvasElement;
  constructor(container: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height } = opts;

    this._opts = opts;
    this._container = container;
    const canvas = document.createElement('canvas');
    this._canvas = canvas;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewContent = createBoardContexts(ctx, { devicePixelRatio });
    const board = new Board<CoreEvent>({ viewContent });
    const sharer = board.getSharer();
    sharer.setActiveViewSizeInfo({
      width,
      height,
      devicePixelRatio,
      contextWidth: width,
      contextHeight: height
    });
    this._board = board;
    this.resize(sharer.getActiveViewSizeInfo());
    const eventHub = board.getEventHub();
    new Cursor(container, {
      eventHub
    });
  }

  use(middleware: BoardMiddleware<any, any>) {
    this._board.use(middleware);
  }

  setData(data: Data) {
    validateElements(data?.elements || []);
    this._board.setData(data);
  }

  getData(): Data | null {
    return this._board.getData();
  }

  scale(opts: { scale: number; point: PointSize }) {
    this._board.scale(opts);
    const viewer = this._board.getViewer();
    viewer.drawFrame();
  }

  resize(newViewSize: Partial<ViewSizeInfo>) {
    const { _board: board } = this;
    const sharer = board.getSharer();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    board.resize({
      ...viewSizeInfo,
      ...newViewSize
    });
  }

  clear() {
    this._board.clear();
  }

  on<T extends keyof CoreEvent>(name: T, callback: (e: CoreEvent[T]) => void) {
    const eventHub = this._board.getEventHub();
    eventHub.on(name, callback);
  }

  off<T extends keyof CoreEvent>(name: T, callback: (e: CoreEvent[T]) => void) {
    const eventHub = this._board.getEventHub();
    eventHub.off(name, callback);
  }

  trigger<T extends keyof CoreEvent>(name: T, e: CoreEvent[T]) {
    const eventHub = this._board.getEventHub();
    eventHub.trigger(name, e);
  }
}
