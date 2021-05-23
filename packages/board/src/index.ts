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
  private _mount: HTMLDivElement;
  private _opts: PrivateOptions;
  private _hasRendered: boolean = false;
  private _ctx: Context;
  // private _watcher: Watcher;

  constructor(mount: HTMLDivElement, opts: Options) {
    this._mount = mount;
    this._canvas = document.createElement('canvas');
    this._mount.appendChild(this._canvas);
    this._opts = this._parsePrivateOptions(opts);
    const ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this._ctx = new Context(ctx, this._opts);
    // this._watcher = new Watcher(this._canvas);
  }

  render() {
    if (this._hasRendered === true) {
      return;
    }
    const { width, height, devicePixelRatio } = this._opts;
    this._canvas.width = width * devicePixelRatio;
    this._canvas.height = height * devicePixelRatio;
    setStyle(this._canvas, {
      width: `${width}px`,
      height: `${height}px`,
    });
    // this._watcher.onMove(this._onMove.bind(this));
    // this._watcher.onMoveStart(this._onMoveStart.bind(this));
    // this._watcher.onMoveEnd(this._onMoveEnd.bind(this));
    this._hasRendered = true;
  }

  draw() {
    // TODO
  }

  getContext(): Context {
    return this._ctx;
  }
  
  private _parsePrivateOptions(opts: Options): PrivateOptions {
    const defaultOpts = {
      devicePixelRatio: 1,
    }
    return { ...defaultOpts, ...opts }
  }

  
}

export default Board;

