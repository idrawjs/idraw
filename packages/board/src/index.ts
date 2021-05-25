// import { TypePoint } from '@idraw/types';
// import { Watcher } from './util/watcher';
import { setStyle } from './util/style';
import Context from './util/context';

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
  private _hasRendered: boolean = false;
  private _ctx: Context;
  private _displayCtx: CanvasRenderingContext2D;
  private _scaleRatio: number = 1;
  // private _watcher: Watcher;

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
    // this._watcher = new Watcher(this._canvas);
    this._render();
  }

  getContext(): Context {
    return this._ctx;
  }

  scale(scaleRatio: number) {
    this._scaleRatio = scaleRatio;
  }

  draw() {
    this.clear();
    this._displayCtx.drawImage(
      this._canvas, 0, 0,
      this._canvas.width * this._scaleRatio,
      this._canvas.height * this._scaleRatio,
    );
  }

  clear() {
    this._displayCtx.clearRect(0, 0, this._displayCanvas.width, this._displayCanvas.height)
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

  
}

export default Board;

