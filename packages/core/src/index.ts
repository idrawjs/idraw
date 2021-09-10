import {
  TypeData, TypePoint, TypeBoardSizeOptions,
  TypeConfig, TypeConfigStrict, TypeElementBase,
  TypeElement, TypeElemDesc, TypeContext, TypeCoreOptions,  TypeScreenContext, TypeScreenData,
}  from '@idraw/types';
import Board from '@idraw/board';
import util from '@idraw/util';
import { Renderer } from './lib/renderer';
import { Element } from './lib/element';
import { Helper } from './lib/helper';
import { Mapper } from './lib/mapper';
import { mergeConfig } from './lib/config';
import { CoreEvent, TypeCoreEventArgMap } from './lib/core-event';
import { parseData } from './lib/parse';
import is, { TypeIs } from './lib/is';
import check, { TypeCheck } from './lib/check';
import { TempData } from './lib/temp';
import {
  _board, _data, _opts, _config, _renderer, _element, _helper,
  _mode, _tempData, _draw, _coreEvent, _mapper,  
  _emitChangeScreen, _emitChangeData, _onlyRender, _cursorStatus,
} from './names';
import { Mode, CursorStatus } from './constant/static';
import { diffElementResourceChangeList } from './lib/diff';
import { getSelectedElements, updateElement, selectElementByIndex, 
  selectElement, moveUpElement, moveDownElement, addElement, deleteElement,
  insertElementBefore, insertElementBeforeIndex, insertElementAfter, insertElementAfterIndex,
} from './mixins/element';
import { initEvent } from './mixins/event';
const { deepClone } = util.data;

class Core {

  private [_board]: Board;
  private [_data]: TypeData;
  private [_opts]: TypeCoreOptions;
  private [_config]: TypeConfigStrict;
  private [_renderer]: Renderer;
  private [_element]: Element;
  private [_helper]: Helper;
  private [_mapper]: Mapper;
  private [_mode]: Mode = Mode.NULL;
  private [_coreEvent]: CoreEvent = new CoreEvent();
  private [_tempData]: TempData;
  private [_onlyRender] = false;
  private [_cursorStatus]: CursorStatus = CursorStatus.NULL;

  static is: TypeIs = is;
  static check: TypeCheck = check;

  constructor(mount: HTMLDivElement, opts: TypeCoreOptions, config?: TypeConfig) {
    this[_data] = { elements: [] };
    this[_opts] = opts;
    this[_onlyRender] = opts.onlyRender === true;
    this[_config] = mergeConfig(config || {});
    this[_tempData] = new TempData();
    this[_board] = new Board(mount, {
      ...this[_opts],
      canScroll: config?.scrollWrapper?.use,
      scrollConfig: {
        color: config?.scrollWrapper?.color || '#a0a0a0',
        lineWidth: config?.scrollWrapper?.lineWidth || 12,
      }
    });
    this[_renderer] = new Renderer(this[_board]); 
    this[_element] = new Element(this[_board].getContext());
    this[_helper] = new Helper(this[_board], this[_config]);
    this[_mapper] = new Mapper({
      board: this[_board],
      helper: this[_helper],
      element: this[_element]
    });
    initEvent(this);
  }

  [_draw](
    opts?: {
      resourceChangeUUIDs?: string[],
    }
  ): void {
    const transfrom = this[_board].getTransform();
    this[_helper].updateConfig(this[_data], {
      width: this[_opts].width,
      height: this[_opts].height,
      canScroll: this[_config]?.scrollWrapper?.use === true,
      selectedUUID: this[_tempData].get('selectedUUID'),
      selectedUUIDList: this[_tempData].get('selectedUUIDList'),
      devicePixelRatio: this[_opts].devicePixelRatio,
      scale: transfrom.scale,
      scrollX: transfrom.scrollX,
      scrollY: transfrom.scrollY,
    });
    this[_renderer].render(this[_data], this[_helper].getConfig(), opts?.resourceChangeUUIDs || []);
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

  __getDisplayContext(): CanvasRenderingContext2D {
    return this[_board].getDisplayContext();
  }

  __getOriginContext(): CanvasRenderingContext2D {
    return this[_board].getOriginContext();
  }


  private [_emitChangeScreen]() {
    if (this[_coreEvent].has('changeScreen')) {
      this[_coreEvent].trigger('changeScreen', {
        ...this.getScreenTransform(),
        // ...{
        //   selectedElementUUID: this[_tempData].get('selectedUUID')
        // }
      });
    }
  }

  private [_emitChangeData]() {
    if (this[_coreEvent].has('changeData')) {
      this[_coreEvent].trigger('changeData', deepClone(this[_data]));
    }
  }

  __todo() {
    console.log(this[_onlyRender])
    console.log(this[_mapper]);
    console.log(this[_cursorStatus]);
    console.log(this[_mode]);
  }
}

export default Core;