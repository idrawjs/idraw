import { TypeScreenPosition, TypeScreenSize, TypeScreenContext } from '@idraw/types';
import { Watcher } from './util/watcher';
import { setStyle } from './util/style';
import Context from './util/context';
import { TypeBoardEventArgMap } from './util/event';
import { Scroller } from './util/scroller';


const _canvas = Symbol('_canvas');
const _displayCanvas = Symbol('_displayCanvas');
const _mount = Symbol('_mount');
const _opts = Symbol('_opts');
const _hasRendered = Symbol('_hasRendered');
const _ctx = Symbol('_ctx');
const _displayCtx = Symbol('_displayCtx');
const _originCtx = Symbol('_originCtx');
const _watcher = Symbol('_watcher');
const _render = Symbol('_render');
const _calcScreen = Symbol('_calcScreen');
const _parsePrivateOptions = Symbol('_parsePrivateOptions');
const _scroller = Symbol('_scroller');

type Options = {
  width: number;
  height: number;
  contextWidth: number;
  contextHeight: number;
  devicePixelRatio?: number;
  canScroll?: boolean;
}

type PrivateOptions = Options & {
  devicePixelRatio: number
}

class Board {
  private [_canvas]: HTMLCanvasElement;
  private [_displayCanvas]: HTMLCanvasElement;
  private [_mount]: HTMLDivElement;
  private [_opts]: PrivateOptions;
  private [_hasRendered] = false;
  private [_ctx]: Context;
  private [_displayCtx]: CanvasRenderingContext2D;
  private [_originCtx]: CanvasRenderingContext2D;
  private [_watcher]: Watcher;
  private [_scroller]: Scroller;

  constructor(mount: HTMLDivElement, opts: Options) {
    this[_mount] = mount;
    this[_canvas] = document.createElement('canvas');
    this[_displayCanvas] = document.createElement('canvas');
    this[_mount].appendChild(this[_displayCanvas]);
    this[_opts] = this[_parsePrivateOptions](opts);
    this[_originCtx] = this[_canvas].getContext('2d') as CanvasRenderingContext2D;
    this[_displayCtx] = this[_displayCanvas].getContext('2d') as CanvasRenderingContext2D;
    this[_ctx] = new Context(this[_originCtx], this[_opts]);
    this[_watcher] = new Watcher(this[_displayCanvas]);
    this[_scroller] = new Scroller(
      this[_displayCtx], {
        width: opts.width,
        height: opts.height,
        devicePixelRatio: opts.devicePixelRatio || 1,
      })
    this[_render]();
  }

  getDisplayContext(): CanvasRenderingContext2D {
    return this[_displayCtx];
  }

  getOriginContext(): CanvasRenderingContext2D {
    return this[_displayCtx];
  }

  getContext(): Context {
    return this[_ctx];
  }

  createContext(canvas: HTMLCanvasElement) {
    const opts = this[_opts];
    canvas.width = opts.contextWidth * opts.devicePixelRatio;
    canvas.height = opts.contextHeight * opts.devicePixelRatio;
    return new Context(canvas.getContext('2d') as CanvasRenderingContext2D, this[_opts]);
  }

  createCanvas() {
    const opts = this[_opts];
    const canvas = document.createElement('canvas');
    canvas.width = opts.contextWidth * opts.devicePixelRatio;
    canvas.height = opts.contextHeight * opts.devicePixelRatio;
    return canvas;
  }

  scale(scaleRatio: number): TypeScreenContext {
    if (scaleRatio > 0) {
      this[_ctx].setTransform({ scale: scaleRatio });
    }
    const { position, size } = this[_calcScreen]();
    return { position, size};
  }

  scrollX(x: number) {
    if (x >= 0 || x < 0) {
      this[_ctx].setTransform({ scrollX: x });
    }
    const { position, size } = this[_calcScreen]();
    return { position, size};
  }

  scrollY(y: number): TypeScreenContext {
    if (y >= 0 || y < 0) {
      this[_ctx].setTransform({ scrollY: y });
    }
    const { position, size } = this[_calcScreen]();
    return { position, size};
  }

  getTransform() {
    return this[_ctx].getTransform();
  }

  draw(): TypeScreenContext {
    this.clear();
    const { position, deviceSize, size } = this[_calcScreen]();
    this[_displayCtx].drawImage(
      this[_canvas], deviceSize.x, deviceSize.y, deviceSize.w, deviceSize.h
    );
    if (this[_opts].canScroll === true) {
      this[_scroller].draw(position);
    }
    return { position, size };
  }

  clear() {
    this[_displayCtx].clearRect(0, 0, this[_displayCanvas].width, this[_displayCanvas].height);
  }

  on<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this[_watcher].on(name, callback);
  }

  off<T extends keyof TypeBoardEventArgMap >(name: T, callback: (p: TypeBoardEventArgMap[T]) => void) {
    this[_watcher].off(name, callback);
  }

  getScreenInfo() {
    return this[_calcScreen]();
  }

  private [_render]() {
    if (this[_hasRendered] === true) {
      return;
    }
    const { width, height, contextWidth, contextHeight, devicePixelRatio } = this[_opts];
    this[_canvas].width = contextWidth * devicePixelRatio;
    this[_canvas].height = contextHeight * devicePixelRatio;

    this[_displayCanvas].width = width * devicePixelRatio;
    this[_displayCanvas].height = height * devicePixelRatio;

    setStyle(this[_displayCanvas], {
      width: `${width}px`,
      height: `${height}px`,
    });
    this[_hasRendered] = true;
  }
  
  private [_parsePrivateOptions](opts: Options): PrivateOptions {
    const defaultOpts = {
      devicePixelRatio: 1,
    };
    return { ...defaultOpts, ...opts };
  }
 

  private [_calcScreen](): {
    size: TypeScreenSize,
    position: TypeScreenPosition,
    deviceSize: TypeScreenSize,
  } {
    const scaleRatio = this[_ctx].getTransform().scale;
    const { 
      width, height, contextWidth, contextHeight,
      devicePixelRatio: pxRatio,
    } = this[_opts];

    // init scroll
    if (contextWidth * scaleRatio <= width) {
      // make context center
      this[_ctx].setTransform({
        scrollX: (width - contextWidth * scaleRatio) / 2,
      })
    }

    if (contextHeight * scaleRatio <= height) {
      // make context center
      this[_ctx].setTransform({
        scrollY: (height - contextHeight * scaleRatio) / 2,
      })
    }

    if (contextWidth * scaleRatio >= width && this[_ctx].getTransform().scrollX > 0) {
      this[_ctx].setTransform({
        scrollX: 0,
      })
    }
    if (contextHeight * scaleRatio >= height && this[_ctx].getTransform().scrollY > 0) {
      this[_ctx].setTransform({
        scrollY: 0,
      })
    }

    const { scrollX: _scrollX, scrollY: _scrollY } = this[_ctx].getTransform();

    // reset scroll
    if (_scrollX < 0 && Math.abs(_scrollX) > Math.abs(contextWidth * scaleRatio - width)) {
      this[_ctx].setTransform({
        scrollX: 0 - Math.abs(contextWidth * scaleRatio - width)
      })
    }
    if (_scrollY < 0 && Math.abs(_scrollY) > Math.abs(contextHeight * scaleRatio - height)) {
      this[_ctx].setTransform({
        scrollY: 0 - Math.abs(contextHeight * scaleRatio - height)
      })
    }

    // result size
    const { scrollX, scrollY } = this[_ctx].getTransform();
    const size = {
      x: scrollX * scaleRatio,
      y: scrollY * scaleRatio,
      w: contextWidth * scaleRatio,
      h: contextHeight * scaleRatio,
    };
    const deviceSize = {
      x: scrollX * pxRatio,
      y: scrollY * pxRatio,
      w: contextWidth * pxRatio * scaleRatio,
      h: contextHeight * pxRatio * scaleRatio,
    };
    const position = {
      top: scrollY,
      bottom: height - (contextHeight * scaleRatio + scrollY),
      left: scrollX,
      right: width - (contextWidth * scaleRatio + scrollX),
    };

    return {
      size, position, deviceSize
    };
  }
}

export default Board;

