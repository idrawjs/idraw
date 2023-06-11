import { Renderer } from '@idraw/renderer';
import { throttle } from '@idraw/util';
import type { Data, BoardMode, BoardOptions, BoardMiddleware, BoardMiddlewareObject, BoardWatcherEventMap, ViewSizeInfo } from '@idraw/types';
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
      viewContent,
      sharer
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
    this._watcher.on('scale', this._handleScale.bind(this));
    this._watcher.on('scrollX', this._handleScrollX.bind(this));
    this._watcher.on('scrollY', this._handleScrollY.bind(this));
    this._watcher.on('resize', this._handleResize.bind(this));
    this._watcher.on('doubleClick', this._handleDoubleClick.bind(this));
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

  private _handleDoubleClick(e: BoardWatcherEventMap['doubleClick']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.doubleClick?.(e);
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

  private _handleScale(e: BoardWatcherEventMap['scale']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.scale?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleScrollX(e: BoardWatcherEventMap['scrollX']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.scrollX?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleScrollY(e: BoardWatcherEventMap['scrollY']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.scrollY?.(e);
      if (result === false) {
        return;
      }
    }
  }

  private _handleResize(e: BoardWatcherEventMap['resize']) {
    for (let i = 0; i < this._activeMiddlewareObjs.length; i++) {
      const obj = this._activeMiddlewareObjs[i];
      const result = obj?.resize?.(e);
      if (result === false) {
        return;
      }
    }
  }

  // draw event
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

  getData(): Data | null {
    const { data } = this._sharer.getActiveStoreSnapshot();
    return data;
  }

  use(middleware: BoardMiddleware) {
    const { viewContent } = this._opts;
    const { _sharer: sharer, _viewer: viewer, _calculator: calculator } = this;
    const obj = middleware({ viewContent, sharer, viewer, calculator });
    this._middlewares.push(middleware);
    this._activeMiddlewareObjs.push(obj);
  }

  scale(num: number) {
    const viewScaleInfo = this._viewer.scale(num);
    this._viewer.drawFrame();
    this._watcher.trigger('scale', viewScaleInfo);
  }

  scrollX(num: number) {
    const viewScaleInfo = this._viewer.scrollX(num);
    this._viewer.drawFrame();
    this._watcher.trigger('scrollX', viewScaleInfo);
  }

  scrollY(num: number) {
    const viewScaleInfo = this._viewer.scrollY(num);
    this._viewer.drawFrame();
    this._watcher.trigger('scrollY', viewScaleInfo);
  }

  resize(newViewSize: ViewSizeInfo) {
    const viewSize = this._viewer.resize(newViewSize);
    const { width, height, devicePixelRatio } = newViewSize;
    const { viewContent } = this._opts;
    viewContent.viewContext.$resize({ width, height, devicePixelRatio });
    const canvas = viewContent.viewContext.canvas;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    viewContent.helperContext.$resize({ width, height, devicePixelRatio });
    viewContent.boardContext.$resize({ width, height, devicePixelRatio });
    this._viewer.drawFrame();
    this._watcher.trigger('resize', viewSize);
    this._sharer.setActiveViewSizeInfo(newViewSize);
  }
}
