// import { TypePoint } from '@idraw/types';
import { Watcher } from './util/watcher';
import { setStyle } from './util/style';
import Context from './util/context';
import { TypeBoardEventArgMap } from './util/event';

type Options = {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
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
  private _originCtx: CanvasRenderingContext2D;
  // private _scaleRatio = 1;
  // private _scrollX = 0;
  // private _scrollY = 0;
  private _watcher: Watcher;

  constructor(mount: HTMLDivElement, opts: Options) {
    this._mount = mount;
    this._canvas = document.createElement('canvas');
    this._displayCanvas = document.createElement('canvas');
    this._mount.appendChild(this._displayCanvas);
    this._opts = this._parsePrivateOptions(opts);
    this._originCtx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this._displayCtx = this._displayCanvas.getContext('2d') as CanvasRenderingContext2D;
    this._ctx = new Context(this._originCtx, this._opts);
    this._watcher = new Watcher(this._displayCanvas);
    this._render();
  }

  getDisplayContext(): CanvasRenderingContext2D {
    return this._displayCtx;
  }

  getOriginContext(): CanvasRenderingContext2D {
    return this._displayCtx;
  }

  getContext(): Context {
    return this._ctx;
  }

  createContext(canvas: HTMLCanvasElement) {
    const opts = this._opts;
    canvas.width = opts.contextWidth * opts.devicePixelRatio;
    canvas.height = opts.contextHeight * opts.devicePixelRatio;
    return new Context(canvas.getContext('2d') as CanvasRenderingContext2D, this._opts);
  }

  createCanvas() {
    const opts = this._opts;
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth * opts.devicePixelRatio;
    canvas.height = opts.contextHeight * opts.devicePixelRatio;
    return canvas;
  }

  scale(scaleRatio: number) {
    if (scaleRatio > 0) {
      this._ctx.setTransform({ scale: scaleRatio });
    }
  }

  scrollX(x: number) {
    if (x >= 0 || x < 0) {
      this._ctx.setTransform({ scrollX: x });
    }
  }

  scrollY(y: number) {
    if (y >= 0 || y < 0) {
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
    this._displayCtx.clearRect(0, 0, this._displayCanvas.width, this._displayCanvas.height);
  }

  on<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._watcher.on(name, callback);
  }

  off<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this._watcher.off(name, callback);
  }

  private _render() {
    if (this._hasRendered === true) {
      return;
    }
    const { width, height, contextWidth, contextHeight, devicePixelRatio } = this._opts;
    this._canvas.width = contextWidth * devicePixelRatio;
    this._canvas.height = contextHeight * devicePixelRatio;

    this._displayCanvas.width = width * devicePixelRatio;
    this._displayCanvas.height = height * devicePixelRatio;

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
    };
    return { ...defaultOpts, ...opts };
  }

  // private _calculateSize(): { x: number; y: number; w: number; h: number } {
  //   const { _scrollX, _scrollY, _scaleRatio, } = this;
  //   const { devicePixelRatio: pxRatio, width, height } = this._opts;
  //   const size = { x: 0, y: 0, w: width * pxRatio, h: height * pxRatio };
  //   size.x = _scrollX * pxRatio * _scaleRatio;
  //   size.y = _scrollY * pxRatio * _scaleRatio;
  //   size.w = width * pxRatio * _scaleRatio;
  //   size.h = height * pxRatio * _scaleRatio;
  //   return size;
  // }

  private _calculateSize(): { x: number; y: number; w: number; h: number } {
    const _scaleRatio = this._ctx.getTransform().scale;
    const { 
      width, height, contextWidth, contextHeight,
      devicePixelRatio: pxRatio,
    } = this._opts;

    // init scroll
    if (contextWidth * _scaleRatio < width && contextWidth * _scaleRatio < width) {
      // make context center
      this._ctx.setTransform({
        scrollX: 0,
        scrollY: 0,
      })
    }


    const { scrollX: _scrollX, scrollY: _scrollY } = this._ctx.getTransform();
    
    const left: number = Math.max(0, (width - contextWidth * _scaleRatio) / 2) * pxRatio;
    const top: number = Math.max(0, (height - contextHeight * _scaleRatio) / 2) * pxRatio;

    // const left: number = 0;
    // const top: number = 0;
    // console.log('left = ', left, 'top =', top);

    const size = { x: 0, y: 0, w: contextWidth * pxRatio, h: contextHeight * pxRatio };
    size.x = left + _scrollX * pxRatio * _scaleRatio;
    size.y = top + _scrollY * pxRatio * _scaleRatio;
    size.w = contextWidth * pxRatio * _scaleRatio;
    size.h = contextHeight * pxRatio * _scaleRatio;
    return size;
  }
  
}

export default Board;

