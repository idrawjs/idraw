import {
  TypeData, TypePoint, TypeBoardSizeOptions,
  TypeHelperWrapperDotDirection, TypeConfig, TypeConfigStrict,
  TypeElement, TypeElemDesc, TypeContext, TypeCoreOptions,  TypeScreenContext,
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
import  * as names from './names';
import { Mode, CursorStatus } from './constant/static';

const { time } = util;
const { deepClone } = util.data;
const { createUUID } = util.uuid;

class Core {

  private [names._board]: Board;
  private [names._data]: TypeData;
  private [names._opts]: TypeCoreOptions;
  private [names._config]: TypeConfigStrict;
  private [names._renderer]: Renderer;
  private [names._element]: Element;
  private [names._helper]: Helper;
  private [names._mapper]: Mapper;
  private [names._hasInited] = false; 
  private [names._hasInitedData] = false; 
  private [names._mode]: Mode = Mode.NULL;
  private [names._coreEvent]: CoreEvent = new CoreEvent();
  private [names._selectedUUID]: string | null = null;
  private [names._selectedUUIDList]: string[] = [];
  private [names._prevPoint]: TypePoint | null = null;
  private [names._selectedDotDirection]: TypeHelperWrapperDotDirection | null = null;
  private [names._onlyRender]: boolean = false;
  private [names._cursorStatus]: CursorStatus = CursorStatus.NULL;

  static is: TypeIs = is;
  static check: TypeCheck = check;

  constructor(mount: HTMLDivElement, opts: TypeCoreOptions, config?: TypeConfig) {
    this[names._data] = { elements: [] };
    this[names._opts] = opts;
    this[names._onlyRender] = opts.onlyRender === true;
    this[names._config] = mergeConfig(config || {});

    this[names._board] = new Board(mount, {
      ...this[names._opts],
      canScroll: config?.scrollWrapper?.use,
      scrollConfig: {
        color: config?.scrollWrapper?.color || '#a0a0a0',
        lineWidth: config?.scrollWrapper?.lineWidth || 12,
      }
    });
    this[names._renderer] = new Renderer(this[names._board]); 
    this[names._element] = new Element(this[names._board].getContext());
    this[names._helper] = new Helper(this[names._board], this[names._config]);
    this[names._mapper] = new Mapper({
      board: this[names._board],
      helper: this[names._helper],
      element: this[names._element]
    });
    this[names._initEvent]();
    this[names._hasInited] = true;
  }

  draw(): void {
    const transfrom = this[names._board].getTransform();
    this[names._helper].updateConfig(this[names._data], {
      width: this[names._opts].width,
      height: this[names._opts].height,
      canScroll: this[names._opts].canScroll === true,
      selectedUUID: this[names._selectedUUID],
      selectedUUIDList: this[names._selectedUUIDList],
      devicePixelRatio: this[names._opts].devicePixelRatio,
      scale: transfrom.scale,
      scrollX: transfrom.scrollX,
      scrollY: transfrom.scrollY,
    });
    this[names._renderer].render(this[names._data], this[names._helper].getConfig());
  }

  resetSize(opts: TypeBoardSizeOptions) {
    this[names._opts] = { ...this[names._opts], ...opts };
    this[names._board].resetSize(opts);
    this.draw();
  }

  selectElement(index: number, opts?: { useMode?: boolean }): void {
    if (this[names._onlyRender] === true) return;
    if (this[names._data].elements[index]) {
      const uuid = this[names._data].elements[index].uuid;
      if (opts?.useMode === true) {
        this[names._mode] = Mode.SELECT_ELEMENT;
      } else {
        this[names._mode] = Mode.NULL;
      }
      this[names._selectedUUID] = uuid;
      this[names._selectedUUIDList] = [];
      this.draw();
    }
  }

  selectElementByUUID(uuid: string, opts?: { useMode?: boolean }): void {
    if (this[names._onlyRender] === true) return;
    const index = this[names._helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0) {
      this.selectElement(index, opts);
    }
  }

  moveDownElement(uuid: string): void {
    if (this[names._onlyRender] === true) return;
    const index = this[names._helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0 && index < this[names._data].elements.length - 1) {
      const temp = this[names._data].elements[index];
      this[names._data].elements[index] = this[names._data].elements[index + 1];
      this[names._data].elements[index + 1] = temp;
    }
    this[names._emitChangeData]();
    this.draw();
  }

  moveUpElement(uuid: string): void {
    if (this[names._onlyRender] === true) return;
    const index = this[names._helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index > 0 && index < this[names._data].elements.length) {
      const temp = this[names._data].elements[index];
      this[names._data].elements[index] = this[names._data].elements[index - 1];
      this[names._data].elements[index - 1] = temp;
    }
    this[names._emitChangeData]();
    this.draw();
  }

  scale(ratio: number): TypeScreenContext {
    const screen = this[names._board].scale(ratio);
    this[names._emitChangeScreen]();
    return screen;
  }

  scrollX(x: number): TypeScreenContext {
    const screen = this[names._board].scrollX(x);
    this[names._emitChangeScreen]();
    return screen;
  }

  scrollY(y: number): TypeScreenContext {
    const screen = this[names._board].scrollY(y);
    this[names._emitChangeScreen]();
    return screen;
  }

  getData(): TypeData {
    return deepClone(this[names._data]);
  }

  initData(data: any | TypeData): void {
    if (this[names._hasInitedData] === true) {
      return;
    }
    this.setData(data);
    this[names._emitChangeData]();
    this[names._hasInitedData] = true;
  }

  setData(data: any | TypeData): void {
    this[names._data] = this[names._element].initData(deepClone(parseData(data)));
    this.draw();
  }

  updateElement(elem: TypeElement<keyof TypeElemDesc>) {
    if (this[names._onlyRender] === true) return;
    const _elem  = deepClone(elem) as TypeElement<keyof TypeElemDesc>;
    const data = this[names._data];
    for (let i = 0; i < data.elements.length; i++) {
      if (_elem.uuid === data.elements[i]?.uuid) {
        data.elements[i] = _elem;
        break;
      }
    }
    this[names._emitChangeData]();
    this.draw();
  }

  addElement(elem: TypeElement<keyof TypeElemDesc>): string | null {
    if (this[names._onlyRender] === true) return null;
    const _elem = deepClone(elem);
    _elem.uuid = createUUID();
    this[names._data].elements.unshift(_elem);
    this[names._emitChangeData]();
    this.draw();
    return _elem.uuid;
  }

  deleteElement(uuid: string) {
    if (this[names._onlyRender] === true) return;
    const index = this[names._element].getElementIndex(this[names._data], uuid);
    if (index >= 0) {
      this[names._data].elements.splice(index, 1);
      this[names._emitChangeData]();
      this.draw();
    }
  }

  on<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[names._coreEvent].on(key, callback);
  }

  off<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[names._coreEvent].off(key, callback);
  }

  __getBoardContext(): TypeContext {
    return this[names._board].getContext();
  }

  __getDisplayContext(): CanvasRenderingContext2D {
    return this[names._board].getDisplayContext()
  }

  __getOriginContext(): CanvasRenderingContext2D {
    return this[names._board].getOriginContext()
  }

  private [names._initEvent](): void {
    if (this[names._onlyRender] === true) {
      return;
    }
    if (this[names._hasInited] === true) {
      return;
    }
    this[names._board].on('point', this[names._handlePoint].bind(this));
    this[names._board].on('moveStart', this[names._handleMoveStart].bind(this));
    this[names._board].on('move', time.throttle(this[names._handleMove].bind(this), 16));
    this[names._board].on('moveEnd', this[names._handleMoveEnd].bind(this));
    this[names._board].on('hover', time.throttle(this[names._handleHover].bind(this), 32));
  }

  private [names._handlePoint](point: TypePoint): void {
    if (!this[names._mapper].isEffectivePoint(point)) {
      return;
    }
    if (this[names._helper].isPointInElementList(point, this[names._data])) {
      // Coontroll Element-List
      this[names._mode] = Mode.SELECT_ELEMENT_LIST;
    } else {
      const [uuid, direction] = this[names._helper].isPointInElementWrapperDot(point);
      if (uuid && direction) {
        // Controll Element-Wrapper
        this[names._mode] = Mode.SELECT_ELEMENT_WRAPPER_DOT;
        this[names._selectedDotDirection] = direction;
        this[names._selectedUUID] = uuid;
      } else {
        const [index, uuid] = this[names._element].isPointInElement(point, this[names._data]);
        if (index >= 0) {
          // Controll Element
          this.selectElement(index, { useMode: true });
          if (typeof uuid === 'string' && this[names._coreEvent].has('screenSelectElement')) {
            this[names._coreEvent].trigger(
              'screenSelectElement', 
              { index, uuid, element: deepClone(this[names._data].elements?.[index])}
            );
            this[names._emitChangeScreen]();
          }
          this[names._mode] = Mode.SELECT_ELEMENT;
        } else {
          // Controll Area
          this[names._selectedUUIDList] = [];
          this[names._mode] = Mode.SELECT_AREA;
        }
      }
    }
    
    this.draw();
  }

  private [names._handleMoveStart](point: TypePoint): void {
    this[names._prevPoint] = point;
    const uuid = this[names._selectedUUID];

    if (this[names._mode] === Mode.SELECT_ELEMENT_LIST) {
      // TODO
    } else if (this[names._mode] === Mode.SELECT_ELEMENT) {
      if (typeof uuid === 'string' && this[names._coreEvent].has('screenMoveElementStart')) {
        this[names._coreEvent].trigger('screenMoveElementStart', {
          index: this[names._element].getElementIndex(this[names._data], uuid),
          uuid,
          x: point.x,
          y: point.y
        });
      } 
    } else if (this[names._mode] === Mode.SELECT_AREA) {
      this[names._helper].startSelectArea(point);
    }
  }

  private [names._handleMove](point: TypePoint): void {
    if (this[names._mode] === Mode.SELECT_ELEMENT_LIST) {
      this[names._dragElements](this[names._selectedUUIDList], point, this[names._prevPoint]);
      this.draw();
      this[names._cursorStatus] = CursorStatus.DRAGGING;
    } else if (typeof this[names._selectedUUID] === 'string') {
      if (this[names._mode] === Mode.SELECT_ELEMENT) {
        this[names._dragElements]([this[names._selectedUUID] as string], point, this[names._prevPoint]);
        this.draw();
        this[names._cursorStatus] = CursorStatus.DRAGGING;
      } else if (this[names._mode] === Mode.SELECT_ELEMENT_WRAPPER_DOT && this[names._selectedDotDirection]) {
        this[names._transfromElement](this[names._selectedUUID] as string, point, this[names._prevPoint], this[names._selectedDotDirection] as TypeHelperWrapperDotDirection);
        this[names._cursorStatus] = CursorStatus.DRAGGING;
      }
    } else if (this[names._mode] === Mode.SELECT_AREA) {
      this[names._helper].changeSelectArea(point);
      this.draw();
    }
    this[names._prevPoint] = point;
  }

  private [names._handleMoveEnd](point: TypePoint): void {
    const uuid = this[names._selectedUUID];
    if (typeof uuid === 'string') {
      const index = this[names._element].getElementIndex(this[names._data], uuid);
      const elem = this[names._data].elements[index];
      if (elem) {
        if (this[names._coreEvent].has('screenMoveElementEnd')) {
          this[names._coreEvent].trigger('screenMoveElementEnd', {
            index,
            uuid,
            x: point.x,
            y: point.y
          });
        }
        if (this[names._coreEvent].has('screenChangeElement')) {
          this[names._coreEvent].trigger('screenChangeElement', {
            index,
            uuid,
            width: elem.w,
            height: elem.h,
            angle: elem.angle || 0
          });
        }
        this[names._emitChangeData]();
      }
    } else if (this[names._mode] === Mode.SELECT_AREA) {
      const uuids = this[names._helper].calcSelectedElements(this[names._data]);
      if (uuids.length > 0) {
        this[names._selectedUUIDList] = uuids;
        this[names._selectedUUID] = null;
      } else {
        this[names._mode] = Mode.NULL;
      }
      this[names._helper].clearSelectedArea();
      this.draw();
    }
    this[names._selectedUUID] = null;
    this[names._prevPoint] = null;
    this[names._cursorStatus] = CursorStatus.NULL;
    this[names._mode] = Mode.NULL;
  }

  private [names._handleHover](point: TypePoint): void {
    if (this[names._mode] === Mode.SELECT_AREA) {
      this[names._board].resetCursor();
    } else if (this[names._cursorStatus] === CursorStatus.NULL) {
      const cursor = this[names._mapper].judgePointCursor(point, this[names._data]);
      this[names._board].setCursor(cursor);
    }
  }

  private [names._dragElements](uuids: string[], point: TypePoint, prevPoint: TypePoint|null): void {
    if (!prevPoint) {
      return;
    }
    uuids.forEach((uuid) => {
      this[names._element].dragElement(this[names._data], uuid, point, prevPoint, this[names._board].getContext().getTransform().scale);
    })
    this.draw();
  }

  private [names._transfromElement](
    uuid: string, point: TypePoint, prevPoint: TypePoint|null, direction: TypeHelperWrapperDotDirection
  ): null | {
    width: number,
    height: number,
    angle: number,
  } {
    if (!prevPoint) {
      return null;
    }
    const result = this[names._element].transformElement(this[names._data], uuid, point, prevPoint, this[names._board].getContext().getTransform().scale, direction);
    this.draw();
    return result;
  }

  private [names._emitChangeScreen]() {
    if (this[names._coreEvent].has('changeScreen')) {
      this[names._coreEvent].trigger('changeScreen', {
        ...this[names._board].getTransform(),
        ...{
          selectedElementUUID: this[names._selectedUUID]
        }
      })
    }
  }

  private [names._emitChangeData]() {
    if (this[names._coreEvent].has('changeData')) {
      this[names._coreEvent].trigger('changeData', deepClone(this[names._data]));
    }
  }
}

export default Core;