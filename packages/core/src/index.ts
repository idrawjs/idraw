import type { Data, PointSize, CoreOptions, BoardMiddleware, ViewSizeInfo } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts, validateElements, calcElementsContextSize } from '@idraw/util';

// export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareScaler } from './middleware/scaler';

export class Core {
  private _board: Board;
  private _opts: CoreOptions;
  private _mount: HTMLDivElement;
  private _canvas: HTMLCanvasElement;
  constructor(mount: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1, width, height } = opts;

    this._opts = opts;
    this._mount = mount;
    const canvas = document.createElement('canvas');
    this._canvas = canvas;
    mount.appendChild(canvas);

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const viewContent = createBoardContexts(ctx, { devicePixelRatio });
    const board = new Board({ viewContent });
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
  }

  use(middleware: BoardMiddleware) {
    this._board.use(middleware);
  }

  setData(data: Data) {
    validateElements(data?.elements || []);
    this._board.setData(data);
  }

  scale(opts: { scale: number; point: PointSize }) {
    this._board.scale(opts);
  }

  // scroll(num: number) {
  //   this._board.scroll(num);
  // }

  resize(newViewSize: ViewSizeInfo) {
    // const sharer = this._board.getSharer();
    // const viewScaleInfo = sharer.getActiveViewScaleInfo();
    this._board.resize(newViewSize);
    // this._board.scale(viewScaleInfo.scale);
    // this._board.scrollX(viewScaleInfo.offsetLeft);
    // this._board.scrollY(viewScaleInfo.offsetTop);
  }

  clear() {
    this._board.clear();
  }
}
