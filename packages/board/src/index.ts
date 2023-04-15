import { Renderer } from '@idraw/renderer';
import { throttle } from '@idraw/util';
import type { Data, BoardMode, BoardOptions, BoardMiddleware, BoardMiddlewareObject, BoardWatcherEventMap, ViewSizeInfo, ViewScaleInfo } from '@idraw/types';
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
  }

  private _handlePointStart(e: BoardWatcherEventMap['pointStart']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.pointStart?.(e);
    });
  }

  private _handlePointEnd(e: BoardWatcherEventMap['pointEnd']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.pointEnd?.(e);
    });
  }

  private _handlePointMove(e: BoardWatcherEventMap['pointMove']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.pointMove?.(e);
    });
  }

  private _handleHover(e: BoardWatcherEventMap['hover']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.hover?.(e);
    });
  }

  private _handleBeforeDrawFrame(e: BoardWatcherEventMap['beforeDrawFrame']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.beforeDrawFrame?.(e);
    });
  }

  private _handleAfterDrawFrame(e: BoardWatcherEventMap['afterDrawFrame']) {
    this._activeMiddlewareObjs.forEach((obj) => {
      obj?.afterDrawFrame?.(e);
    });
  }

  private _resetActiveMiddlewareObjs() {
    const { _activeMode: activeMode } = this;
    const modes: BoardMode[] = [...LOCK_MODES, activeMode];
    const activeMiddlewareObjs: BoardMiddlewareObject[] = [];
    this._middlewareObjs.forEach((m) => {
      if (modes.includes(m.mode)) {
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
    const { _viewer: viewer, _sharer: share, _renderer: renderer, _calculator: calculator } = this;
    const prevScaleInfo: ViewScaleInfo = share.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = share.getActiveViewSizeInfo();
    const scaleInfo = calculator.viewScale(num, prevScaleInfo, viewSizeInfo);
    share.setActiveScaleInfo(scaleInfo);
    renderer.scale(num);
    viewer.drawFrame();
  }

  scrollX(num: number) {
    // TODO
  }

  scrollY(num: number) {
    // TODO
  }
}
