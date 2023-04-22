import { Renderer } from '@idraw/renderer';
import { throttle } from '@idraw/util';
import type { Data, BoardMode, BoardOptions, BoardMiddleware, BoardMiddlewareObject, BoardWatcherEventMap } from '@idraw/types';
import { Calculator } from './lib/calculator';
import { BoardWatcher } from './lib/watcher';
import { Sharer } from './lib/sharer';
import { Viewer } from './lib/viewer';

const frameTime = 16; // ms

const LOCK_MODES: BoardMode[] = ['RULER'];

export class Board {
  private _opts: BoardOptions;
  private _middlewares: BoardMiddleware[] = [];
  private _middlewareObjs: BoardMiddlewareObject[] = [];
  private _activeMiddlewareObjs: BoardMiddlewareObject[] = [];
  private _watcher: BoardWatcher;
  private _sharer: Sharer;
  private _renderer: Renderer;
  private _viewer: Viewer;
  private _calculator: Calculator;
  private _activeMode: BoardMode = 'SELECT';
  constructor(opts: BoardOptions) {
    const { viewContent } = opts;
    const sharer = new Sharer();
    const calculator = new Calculator({ viewContent });
    const watcher = new BoardWatcher({
      viewContent
    });
    const renderer = new Renderer({
      viewContent,
      sharer,
      calculator
    });

    this._opts = opts;
    this._sharer = sharer;
    this._renderer = renderer;
    this._watcher = watcher;
    this._calculator = calculator;
    this._viewer = new Viewer({
      viewContent: opts.viewContent,
      sharer,
      renderer,
      calculator,
      beforeDrawFrame: (e) => {
        this._handleBeforeDrawFrame(e);
      },
      afterDrawFrame: (e) => {
        this._handleAfterDrawFrame(e);
      }
    });
    this._init();
    this._resetActiveMiddlewareObjs();
  }

  private _init() {
    this._watcher.on('pointStart', this._handlePointStart.bind(this));
    this._watcher.on('pointEnd', this._handlePointEnd.bind(this));
    this._watcher.on(
      'pointMove',
      throttle((e) => {
        this._handlePointMove(e);
      }, frameTime)
    );
    this._watcher.on(
      'hover',
      throttle((e) => {
        this._handleHover(e);
      }, frameTime)
    );
    this._watcher.on(
      'wheelX',
      throttle((e) => {
        this._handleWheelX(e);
      }, frameTime)
    );
    this._watcher.on(
      'wheelY',
      throttle((e) => {
        this._handleWheelY(e);
      }, frameTime)
    );
  }

  private _handlePointStart(e: BoardWatcherEventMap['pointStart']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.pointStart?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handlePointEnd(e: BoardWatcherEventMap['pointEnd']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.pointEnd?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handlePointMove(e: BoardWatcherEventMap['pointMove']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.pointMove?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleHover(e: BoardWatcherEventMap['hover']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.hover?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleWheelX(e: BoardWatcherEventMap['wheelX']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.wheelX?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleWheelY(e: BoardWatcherEventMap['wheelY']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.wheelY?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleBeforeDrawFrame(e: BoardWatcherEventMap['beforeDrawFrame']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.beforeDrawFrame?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleAfterDrawFrame(e: BoardWatcherEventMap['afterDrawFrame']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.afterDrawFrame?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _resetActiveMiddlewareObjs() {
    const { _activeMode: activeMode } = this;
    const modes: BoardMode[] = [...LOCK_MODES, activeMode];
    const activeMiddlewareObjs: BoardMiddlewareObject[] = [];
    this._middlewareObjs.forEach((m) => {
      if (m.isDefault === true) {
        activeMiddlewareObjs.push(m);
      } else if (modes.includes(m.mode)) {
        activeMiddlewareObjs.push(m);
      }
    });
    this._activeMiddlewareObjs = activeMiddlewareObjs;
  }

  getSharer() {
    return this._sharer;
  }

  setData(data: Data) {
    this._sharer.setActiveStorage('data', data);
    this._viewer.drawFrame();
  }

  use(middleware: BoardMiddleware) {
    const { viewContent } = this._opts;
    const { _sharer: sharer, _viewer: viewer, _calculator: calculator } = this;
    const obj = middleware({ viewContent, sharer, viewer, calculator });
    this._middlewares.push(middleware);
    this._activeMiddlewareObjs.push(obj);
  }

  scale(num: number) {
    this._viewer.scale(num);
    this._viewer.drawFrame();
  }

  scrollX(num: number) {
    this._viewer.scrollX(num);
    this._viewer.drawFrame();
  }

  scrollY(num: number) {
    this._viewer.scrollY(num);
    this._viewer.drawFrame();
  }
}
