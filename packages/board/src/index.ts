// import { TypePoint } from '@idraw/types';
import { Watcher } from './util/watcher';
import { setStyle } from './util/style';
import Context from './util/context';
import { TypeBoardEventArgMap } from './util/event';

type Options = {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

type PrivateOptions = Options & {
  devicePixelRatio: number
}

class Board {
  private _canvas: HTMLCanvasElement;
  private _displayCanvas: HTMLCanvasElement;
  private _mount: HTMLDivElement;
  private _opts: PrivateOptions;
  private _hasRendered = false;
  private _ctx: Context;
  private _displayCtx: CanvasRenderingContext2D;
  private _scaleRatio = 1;
  private _scrollX = 0;
  private _scrollY = 0;
  private _watcher: Watcher;

  constructor(mount: HTMLDivElement, opts: Options) {
    this._mount = mount;
    this._canvas = document.createElement('canvas');
    this._displayCanvas = document.createElement('canvas');
    this._mount.appendChild(this._displayCanvas);
    this._opts = this._parsePrivateOptions(opts);
    const ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    const displayCtx = this._displayCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._ctx = new Context(ctx, this._opts);
    this._displayCtx = displayCtx;
    this._watcher = new Watcher(this._displayCanvas);

    this._render();
  }

  getContext(): Context {
    return this._ctx;
  }

  scale(scaleRatio: number) {
    if (scaleRatio > 0) {
      this._scaleRatio = scaleRatio;
      this._ctx.setTransform({ scale: scaleRatio });
    }
  }

  scrollX(x: number) {
    if (x >= 0) {
      this._scrollX = x;
      this._ctx.setTransform({ scrollX: x });
    }
  }

  scrollY(y: number) {
    if (y >= 0) {
      this._scrollY = y;
      this._ctx.setTransform({ scrollY: y });
    }
  }

  getTransform() {
    return this._ctx.getTransform();
  }

  draw() {
    this.clear();
    const size = this._calculateSize();
    this._displayCtx.drawImage(this._canvas, size.x, size.y, size.w, size.h);
  }

  clear() {
    this._displayCtx.clearRect(0, 0, this._displayCanvas.width, this._displayCanvas.height)
  }

  on<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._watcher.on(name, callback)
  }

  off<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._watcher.off(name, callback)
  }

  private _render() {
    if (this._hasRendered === true) {
      return;
    }
    const { width, height, devicePixelRatio } = this._opts;
    this._canvas.width = width * devicePixelRatio;
    this._canvas.height = height * devicePixelRatio;

    this._displayCanvas.width = this._canvas.width;
    this._displayCanvas.height = this._canvas.height;

    setStyle(this._displayCanvas, {
      width: `${width}px`,
      height: `${height}px`,
    });
    // this._watcher.onMove(this._onMove.bind(this));
    // this._watcher.onMoveStart(this._onMoveStart.bind(this));
    // this._watcher.onMoveEnd(this._onMoveEnd.bind(this));
    this._hasRendered = true;
  }
  
  private _parsePrivateOptions(opts: Options): PrivateOptions {
    const defaultOpts = {
      devicePixelRatio: 1,
    }
    return { ...defaultOpts, ...opts }
  }

  private _calculateSize(): { x: number; y: number; w: number; h: number } {
    const { _scrollX, _scrollY, _scaleRatio, } = this;
    const { devicePixelRatio: pxRatio, width, height } = this._opts;
    const size = { x: 0, y: 0, w: width * pxRatio, h: height * pxRatio };
    size.x = _scrollX * pxRatio * _scaleRatio;
    size.y = _scrollY * pxRatio * _scaleRatio;
    size.w = width * pxRatio * _scaleRatio;
    size.h = height * pxRatio * _scaleRatio;
    return size;
  }
  
}

export default Board;

