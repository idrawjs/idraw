import type { Data, CoreOptions, BoardMiddleware, ViewSizeInfo } from '@idraw/types';
import { Board } from '@idraw/board';
import { createBoardContexts, validateElements, calcElementsContextSize } from '@idraw/util';

// export { MiddlewareSelector } from './middleware/selector';
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
      width,
      height,
      devicePixelRatio,
      contextX: 0,
      contextY: 0,
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
    const sharer = this._board.getSharer();
    const currentViewSize = sharer.getActiveViewSizeInfo();
    // const currentScaleInfo = sharer.getActiveScaleInfo();
    const newViewContextSize = calcElementsContextSize(data.elements, {
      viewWidth: currentViewSize.width,
      viewHeight: currentViewSize.height,
      extend: true
    });
    this.resize({
      ...currentViewSize,
      ...newViewContextSize
    });
    this.scrollX(newViewContextSize.contextX);
    this.scrollY(newViewContextSize.contextY);
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

  resize(newViewSize: ViewSizeInfo) {
    // const sharer = this._board.getSharer();
    // const viewScaleInfo = sharer.getActiveScaleInfo();
    this._board.resize(newViewSize);
    // this._board.scale(viewScaleInfo.scale);
    // this._board.scrollX(viewScaleInfo.offsetLeft);
    // this._board.scrollY(viewScaleInfo.offsetTop);
  }
}
