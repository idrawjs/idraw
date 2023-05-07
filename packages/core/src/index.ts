import type { Data, CoreOptions, BoardMiddleware, ViewSizeInfo } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts, validateElements } from '@idraw/util';

export { MiddlewareSelector } from './middleware/selector';
export { MiddlewareScroller } from './middleware/scroller';
export { MiddlewareRuler } from './middleware/rule';

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
      devicePixelRatio,
      width: opts.width,
      height: opts.height,
      contextWidth: opts.contextWidth || opts.width,
      contextHeight: opts.contextHeight || opts.height
    });
    this._board = board;
    this.resize({
      width,
      height,
      devicePixelRatio
    });
  }

  use(middleware: BoardMiddleware) {
    this._board.use(middleware);
  }

  setData(data: Data) {
    // TODO
    validateElements(data?.elements || []);
    this._board.setData(data);
  }

  scale(num: number) {
    this._board.scale(num);
  }

  scrollX(num: number) {
    this._board.scrollX(num);
  }

  scrollY(num: number) {
    this._board.scrollY(num);
  }

  resize(newViewSize: Pick<ViewSizeInfo, 'height' | 'width' | 'devicePixelRatio'>) {
    this._board.resize(newViewSize);
  }
}
