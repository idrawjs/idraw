import {
  TypeData, TypePoint, TypeBoardSizeOptions,
  TypeConfig, TypeConfigStrict, TypeElementBase,
  TypeElement, TypeElemDesc, TypeContext, TypeCoreOptions,  TypeScreenContext, TypeScreenData,
}  from '@idraw/types';
import { Board } from '@idraw/board';
import { deepClone } from '@idraw/util';
import { Renderer } from '@idraw/renderer';
import is, { TypeIs } from './lib/is';
import check, { TypeCheck } from './lib/check';
import {
  Element, mergeConfig, CoreEvent, 
  TypeCoreEventArgMap, parseData, TempData, diffElementResourceChangeList, 
} from './lib';
import {
  _board, _data, _opts, _config, _renderer, _element, _tempData, _draw, _coreEvent, 
  _mapper, _emitChangeScreen, _emitChangeData, _engine,
} from './names';
import { getSelectedElements, updateElement, selectElementByIndex, getElement, getElementByIndex,
  selectElement, moveUpElement, moveDownElement, addElement, deleteElement,
  insertElementBefore, insertElementBeforeIndex, insertElementAfter, insertElementAfterIndex,
} from './mixins/element';
// import { initEvent } from './mixins/event';
import { Engine } from './lib/engine';
import { drawElementWrapper, drawAreaWrapper, drawElementListWrappers } from './lib/draw/wrapper'

export class Core {

  private [_board]: Board;
  private [_data]: TypeData;
  private [_opts]: TypeCoreOptions;
  private [_config]: TypeConfigStrict;
  private [_renderer]: Renderer;
  private [_element]: Element;
  private [_coreEvent]: CoreEvent = new CoreEvent();
  private [_tempData]: TempData = new TempData();
  private [_engine]: Engine;

  static is: TypeIs = is;
  static check: TypeCheck = check;

  constructor(mount: HTMLDivElement, opts: TypeCoreOptions, config?: TypeConfig) {
    this[_data] = { elements: [] };
    this[_opts] = opts;
    this[_config] = mergeConfig(config || {});
    this[_board] = new Board(mount, {
      ...this[_opts],
      canScroll: config?.scrollWrapper?.use,
      scrollConfig: {
        color: config?.scrollWrapper?.color || '#a0a0a0',
        lineWidth: config?.scrollWrapper?.lineWidth || 12,
      }
    });
    this[_renderer] = new Renderer(); 
    const drawFrame = () => {
      const helperCtx = this[_board].getHelperContext();
      const helperConfig = this[_engine].getHelperConfig();
      this[_board].clear();
      const { contextWidth, contextHeight, devicePixelRatio } = this[_opts];
      helperCtx.clearRect(0, 0, contextWidth * devicePixelRatio, contextHeight * devicePixelRatio)
      drawElementWrapper(helperCtx, helperConfig);
      drawAreaWrapper(helperCtx, helperConfig);
      drawElementListWrappers(helperCtx, helperConfig);
      this[_board].draw();
    }
    this[_renderer].on('drawFrame', (e) => {
      drawFrame();
    })
    this[_renderer].on('drawFrameComplete', (e) => {
      drawFrame();
    })
    this[_element] = new Element(this[_board].getContext());
    this[_engine] = new Engine({
      coreEvent: this[_coreEvent],
      board: this[_board],
      element: this[_element],
      config: this[_config],
      drawFeekback: this[_draw].bind(this),
      getDataFeekback: () => this[_data],
      selectElementByIndex: this.selectElementByIndex.bind(this),
      emitChangeScreen: this[_emitChangeScreen].bind(this),
      emitChangeData: this[_emitChangeData].bind(this),
    });
    this[_engine].init();

    this[_renderer].on('drawFrame', () => {
      this[_coreEvent].trigger('drawFrame', undefined);
    });
    this[_renderer].on('drawFrameComplete', () => {
      this[_coreEvent].trigger('drawFrameComplete', undefined);
    })
  
    this[_tempData].set('hasInited', true);
  }

  [_draw](
    opts?: {
      resourceChangeUUIDs?: string[],
    }
  ): void {
    this[_engine].updateHelperConfig({
      width: this[_opts].width,
      height: this[_opts].height,
      devicePixelRatio: this[_opts].devicePixelRatio,
    });

    this[_renderer].thaw();
    this[_renderer].render(this[_board].getContext(), this[_data], {
      changeResourceUUIDs: opts?.resourceChangeUUIDs || []
    });
  }

  getElement(uuid: string) {
    return getElement(this, uuid);
  }

  getElementByIndex(index: number) {
    return getElementByIndex(this, index);
  }

  selectElementByIndex(index: number, opts?: { useMode?: boolean }): void {
    return selectElementByIndex(this, index, opts)
  }

  selectElement(uuid: string, opts?: { useMode?: boolean }): void {
    return selectElement(this, uuid, opts);
  }

  moveUpElement(uuid: string): void {
    return moveUpElement(this, uuid);
  }

  moveDownElement(uuid: string): void {
    return moveDownElement(this, uuid);
  }

  updateElement(elem: TypeElement<keyof TypeElemDesc>) {
    return updateElement(this, elem);
  }

  addElement(elem: TypeElementBase<keyof TypeElemDesc>): string | null {
    return addElement(this, elem);
  }

  deleteElement(uuid: string) {
    return deleteElement(this, uuid);
  }

  insertElementBefore(elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
    return insertElementBefore(this, elem, beforeUUID);
  }

  insertElementBeforeIndex(elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
    return insertElementBeforeIndex(this, elem, index)
  }

  getSelectedElements() {
    return getSelectedElements(this);
  }

  insertElementAfter(elem: TypeElementBase<keyof TypeElemDesc>, beforeUUID: string) {
    return insertElementAfter(this, elem, beforeUUID);
  }

  insertElementAfterIndex(elem: TypeElementBase<keyof TypeElemDesc>, index: number) {
    return insertElementAfterIndex(this, elem, index)
  }

  resetSize(opts: TypeBoardSizeOptions) {
    this[_opts] = { ...this[_opts], ...opts };
    this[_board].resetSize(opts);
    this[_draw]();
  }

  scale(ratio: number): TypeScreenContext {
    const screen = this[_board].scale(ratio);
    this[_draw]();
    this[_emitChangeScreen]();
    return screen;
  }

  scrollLeft(left: number): TypeScreenContext {
    const screen = this[_board].scrollX(0 - left);
    this[_draw]();
    this[_emitChangeScreen]();
    return screen;
  }

  scrollTop(top: number): TypeScreenContext {
    const screen = this[_board].scrollY(0 - top);
    this[_draw]();
    this[_emitChangeScreen]();
    return screen;
  }

  getScreenTransform(): TypeScreenData {
    const transform = this[_board].getTransform();
    return {
      scale: transform.scale,
      scrollTop: Math.max(0, 0 - transform.scrollY),
      scrollLeft: Math.max(0, 0 - transform.scrollX),
    }
  }

  getData(): TypeData {
    return deepClone(this[_data]);
  }

  setData(data: any | TypeData, opts?: { triggerChangeEvent: boolean }): void {
    const resourceChangeUUIDs = diffElementResourceChangeList(this[_data], data);
    this[_data] = this[_element].initData(deepClone(parseData(data)));
    if (opts && opts.triggerChangeEvent === true) {
      this[_emitChangeData]();
    }
    this[_draw]({ resourceChangeUUIDs });
  }

  clearOperation() {
    this[_tempData].clear();
    this[_draw]();
  }

  on<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[_coreEvent].on(key, callback);
  }

  off<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[_coreEvent].off(key, callback);
  }

  pointScreenToContext(p: TypePoint) {
    return this[_board].pointScreenToContext(p);
  }

  pointContextToScreen(p: TypePoint) {
    return this[_board].pointContextToScreen(p);
  }

  __getBoardContext(): TypeContext {
    return this[_board].getContext();
  }

  __getDisplayContext2D(): CanvasRenderingContext2D {
    return this[_board].getDisplayContext2D();
  }

  __getOriginContext2D(): CanvasRenderingContext2D {
    return this[_board].getOriginContext2D();
  }


  private [_emitChangeScreen]() {
    if (this[_coreEvent].has('changeScreen')) {
      this[_coreEvent].trigger('changeScreen', {
        ...this.getScreenTransform(),
      });
    }
  }

  private [_emitChangeData]() {
    if (this[_coreEvent].has('changeData')) {
      this[_coreEvent].trigger('changeData', deepClone(this[_data]));
    }
  }
}
