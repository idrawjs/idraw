import type { Data, CoreOptions, BoardMiddleware } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts } from '@idraw/util';

export { MiddlewareSelector } from './middleware/select';
export { MiddlewareScroller } from './middleware/scroll';

export class Core {
  private _board: Board;
  private _opts: CoreOptions;
  private _mount: HTMLDivElement;
  constructor(mount: HTMLDivElement, opts: CoreOptions) {
    const { devicePixelRatio = 1 } = opts;
    this._opts = opts;
    this._mount = mount;
    const canvas = document.createElement('canvas');
    canvas.width = opts.width * devicePixelRatio;
    canvas.height = opts.height * devicePixelRatio;
    canvas.style.width = `${opts.width}px`;
    canvas.style.height = `${opts.height}px`;
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
  }

  use(middleware: BoardMiddleware) {
    this._board.use(middleware);
  }

  setData(data: Data) {
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
}
