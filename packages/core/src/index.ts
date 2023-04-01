import {
  IDrawData,
  Point,
  BoardSizeOptions,
  IDrawConfig,
  IDrawConfigStrict,
  DataElementBase,
  DataElement,
  DataElemDesc,
  IDrawContext,
  CoreOptions,
  ScreenContext,
  ScreenData
} from '@idraw/types';
import Board from '@idraw/board';
import { deepClone } from '@idraw/util';
import Renderer from '@idraw/renderer';
import is, { IsTypeUtil } from './lib/is';
import check, { CheckTypeUtil } from './lib/check';
import {
  Element,
  mergeConfig,
  CoreEvent,
  TypeCoreEventArgMap,
  parseData,
  TempData,
  diffElementResourceChangeList
} from './lib';
import {
  getSelectedElements,
  updateElement,
  selectElementByIndex,
  selectElement,
  cancelElementByIndex,
  cancelElement,
  getElement,
  getElementByIndex,
  moveUpElement,
  moveDownElement,
  addElement,
  deleteElement,
  insertElementBefore,
  insertElementBeforeIndex,
  insertElementAfter,
  insertElementAfterIndex
} from './mixins/element';
// import { initEvent } from './mixins/event';
import { Engine } from './lib/engine';
import {
  drawElementWrapper,
  drawAreaWrapper,
  drawElementListWrappers
} from './lib/draw/wrapper';

export default class Core {
  private _board: Board;
  private _data: IDrawData;
  private _opts: CoreOptions;
  private _config: IDrawConfigStrict;
  private _renderer: Renderer;
  private _elementHandler: Element;
  private _coreEvent: CoreEvent = new CoreEvent();
  private _tempData: TempData = new TempData();
  private _engine: Engine;

  static is: IsTypeUtil = is;
  static check: CheckTypeUtil = check;

  constructor(mount: HTMLDivElement, opts: CoreOptions, config?: IDrawConfig) {
    this._data = { elements: [] };
    this._opts = opts;
    this._config = mergeConfig(config || {});
    this._board = new Board(mount, {
      ...this._opts,
      canScroll: config?.scrollWrapper?.use,
      scrollConfig: {
        color: config?.scrollWrapper?.color || '#000000',
        width: config?.scrollWrapper?.width || 12,
        ...(config?.scrollWrapper || {})
      }
    });
    this._renderer = new Renderer();
    const drawFrame = () => {
      const helperCtx = this._board.getHelperContext();
      const helperConfig = this._engine.getHelperConfig();
      this._board.clear();
      const { contextWidth, contextHeight, devicePixelRatio } = this._opts;
      helperCtx.clearRect(
        0,
        0,
        contextWidth * devicePixelRatio,
        contextHeight * devicePixelRatio
      );
      drawElementWrapper(helperCtx, helperConfig);
      drawAreaWrapper(helperCtx, helperConfig);
      drawElementListWrappers(helperCtx, helperConfig);
      this._board.draw();
    };
    this._renderer.on('drawFrame', () => {
      drawFrame();
    });
    this._renderer.on('drawFrameComplete', () => {
      drawFrame();
    });
    this._elementHandler = new Element(this._board.getContext());
    this._engine = new Engine({
      coreEvent: this._coreEvent,
      board: this._board,
      element: this._elementHandler,
      config: this._config,
      drawFeekback: this.__draw.bind(this),
      getDataFeekback: () => this._data,
      selectElementByIndex: this.selectElementByIndex.bind(this),
      emitChangeScreen: this._emitChangeScreen.bind(this),
      emitChangeData: this.__emitChangeData.bind(this)
    });
    this._engine.init();

    this._renderer.on('drawFrame', () => {
      this._coreEvent.trigger('drawFrame', undefined);
    });
    this._renderer.on('drawFrameComplete', () => {
      this._coreEvent.trigger('drawFrameComplete', undefined);
    });

    this._tempData.set('hasInited', true);
  }

  private _emitChangeScreen() {
    if (this._coreEvent.has('changeScreen')) {
      this._coreEvent.trigger('changeScreen', {
        ...this.getScreenTransform()
      });
    }
  }

  __draw(opts?: { resourceChangeUUIDs?: string[] }): void {
    this._engine.updateHelperConfig({
      width: this._opts.width,
      height: this._opts.height,
      devicePixelRatio: this._opts.devicePixelRatio
    });

    this._renderer.thaw();
    this._renderer.render(this._board.getContext(), this._data, {
      changeResourceUUIDs: opts?.resourceChangeUUIDs || []
    });
  }

  getElement(uuid: string) {
    return getElement(this, uuid);
  }

  getElementByIndex(index: number) {
    return getElementByIndex(this, index);
  }

  selectElementByIndex(index: number): void {
    return selectElementByIndex(this, index);
  }

  selectElement(uuid: string): void {
    return selectElement(this, uuid);
  }

  cancelElementByIndex(index: number): void {
    return cancelElementByIndex(this, index);
  }

  cancelElement(uuid: string): void {
    return cancelElement(this, uuid);
  }

  moveUpElement(uuid: string): void {
    return moveUpElement(this, uuid);
  }

  moveDownElement(uuid: string): void {
    return moveDownElement(this, uuid);
  }

  updateElement(elem: DataElement<keyof DataElemDesc>) {
    return updateElement(this, elem);
  }

  addElement(elem: DataElementBase<keyof DataElemDesc>): string | null {
    return addElement(this, elem);
  }

  deleteElement(uuid: string) {
    return deleteElement(this, uuid);
  }

  insertElementBefore(
    elem: DataElementBase<keyof DataElemDesc>,
    beforeUUID: string
  ) {
    return insertElementBefore(this, elem, beforeUUID);
  }

  insertElementBeforeIndex(
    elem: DataElementBase<keyof DataElemDesc>,
    index: number
  ) {
    return insertElementBeforeIndex(this, elem, index);
  }

  getSelectedElements() {
    return getSelectedElements(this);
  }

  insertElementAfter(
    elem: DataElementBase<keyof DataElemDesc>,
    beforeUUID: string
  ) {
    return insertElementAfter(this, elem, beforeUUID);
  }

  insertElementAfterIndex(
    elem: DataElementBase<keyof DataElemDesc>,
    index: number
  ) {
    return insertElementAfterIndex(this, elem, index);
  }

  resetSize(opts: BoardSizeOptions) {
    this._opts = { ...this._opts, ...opts };
    this._board.resetSize(opts);
    this.__draw();
  }

  scale(ratio: number): ScreenContext {
    const screen = this._board.scale(ratio);
    this.__draw();
    this._emitChangeScreen();
    return screen;
  }

  scrollLeft(left: number): ScreenContext {
    const screen = this._board.scrollX(0 - left);
    this.__draw();
    this._emitChangeScreen();
    return screen;
  }

  scrollTop(top: number): ScreenContext {
    const screen = this._board.scrollY(0 - top);
    this.__draw();
    this._emitChangeScreen();
    return screen;
  }

  getScreenTransform(): ScreenData {
    const transform = this._board.getTransform();
    return {
      scale: transform.scale,
      scrollTop: Math.max(0, 0 - transform.scrollY),
      scrollLeft: Math.max(0, 0 - transform.scrollX)
    };
  }

  getData(): IDrawData {
    return this._data;
  }

  setData(data: any | IDrawData, opts?: { triggerChangeEvent: boolean }): void {
    const resourceChangeUUIDs = diffElementResourceChangeList(this._data, data);
    this._data = this._elementHandler.initData(deepClone(parseData(data)));
    if (opts && opts.triggerChangeEvent === true) {
      this.__emitChangeData();
    }
    this.__draw({ resourceChangeUUIDs });
  }

  clearOperation() {
    this._tempData.clear();
    this.__draw();
  }

  on<T extends keyof TypeCoreEventArgMap>(
    key: T,
    callback: (p: TypeCoreEventArgMap[T]) => void
  ) {
    this._coreEvent.on(key, callback);
  }

  off<T extends keyof TypeCoreEventArgMap>(
    key: T,
    callback: (p: TypeCoreEventArgMap[T]) => void
  ) {
    this._coreEvent.off(key, callback);
  }

  getEngine() {
    return this._engine;
  }

  pointScreenToContext(p: Point) {
    return this._board.pointScreenToContext(p);
  }

  pointContextToScreen(p: Point) {
    return this._board.pointContextToScreen(p);
  }

  __getBoardContext(): IDrawContext {
    return this._board.getContext();
  }

  __getDisplayContext2D(): CanvasRenderingContext2D {
    return this._board.getDisplayContext2D();
  }

  __getOriginContext2D(): CanvasRenderingContext2D {
    return this._board.getOriginContext2D();
  }

  __emitChangeData() {
    if (this._coreEvent.has('changeData')) {
      this._coreEvent.trigger('changeData', deepClone(this._data));
    }
  }

  __getElementHandler() {
    return this._elementHandler;
  }
}
