import {
  TypeData, TypePoint, TypeBoardSizeOptions,
  TypeHelperWrapperDotDirection, TypeConfig, TypeConfigStrict, TypeElementBase,
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
  _board, _data, _opts, _config, _renderer, _element, _helper, _hasInited,
  _mode, _tempData, _prevPoint, _draw,
  _selectedDotDirection, _coreEvent, _mapper, _initEvent, _handlePoint, _handleClick,
  _handleMoveStart, _handleMove, _handleMoveEnd, _handleHover, _dragElements,
  _transfromElement, _emitChangeScreen, _emitChangeData, _onlyRender, _cursorStatus,
} from './names';
import { Mode, CursorStatus } from './constant/static';

const { time } = util;
const { deepClone } = util.data;
const { createUUID } = util.uuid;

class Core {

  private [_board]: Board;
  private [_data]: TypeData;
  private [_opts]: TypeCoreOptions;
  private [_config]: TypeConfigStrict;
  private [_renderer]: Renderer;
  private [_element]: Element;
  private [_helper]: Helper;
  private [_mapper]: Mapper;
  private [_hasInited] = false; 
  private [_mode]: Mode = Mode.NULL;
  private [_coreEvent]: CoreEvent = new CoreEvent();
  private [_tempData]: TempData;
  private [_prevPoint]: TypePoint | null = null;
  private [_selectedDotDirection]: TypeHelperWrapperDotDirection | null = null;
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
    this[_initEvent]();
    this[_hasInited] = true;
  }

  [_draw](): void {
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
    this[_renderer].render(this[_data], this[_helper].getConfig());
  }

  resetSize(opts: TypeBoardSizeOptions) {
    this[_opts] = { ...this[_opts], ...opts };
    this[_board].resetSize(opts);
    this[_draw]();
  }

  selectElementByIndex(index: number, opts?: { useMode?: boolean }): void {
    if (this[_onlyRender] === true) return;
    if (this[_data].elements[index]) {
      const uuid = this[_data].elements[index].uuid;
      if (opts?.useMode === true) {
        this[_mode] = Mode.SELECT_ELEMENT;
      } else {
        this[_mode] = Mode.NULL;
      }
      if (typeof uuid === 'string') {
        this[_tempData].set('selectedUUID', uuid);
        this[_tempData].set('selectedUUIDList', []);
      }
      this[_draw]();
    }
  }

  selectElement(uuid: string, opts?: { useMode?: boolean }): void {
    if (this[_onlyRender] === true) return;
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0) {
      this.selectElementByIndex(index, opts);
    }
  }

  moveUpElement(uuid: string): void {
    if (this[_onlyRender] === true) return;
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0 && index < this[_data].elements.length - 1) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index + 1];
      this[_data].elements[index + 1] = temp;
    }
    this[_emitChangeData]();
    this[_draw]();
  }

  moveDownElement(uuid: string): void {
    if (this[_onlyRender] === true) return;
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index > 0 && index < this[_data].elements.length) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index - 1];
      this[_data].elements[index - 1] = temp;
    }
    this[_emitChangeData]();
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
    this[_data] = this[_element].initData(deepClone(parseData(data)));
    if (opts && opts.triggerChangeEvent === true) {
      this[_emitChangeData]();
    }
    this[_draw]();
  }

  updateElement(elem: TypeElement<keyof TypeElemDesc>) {
    if (this[_onlyRender] === true) return;
    const _elem  = deepClone(elem) as TypeElement<keyof TypeElemDesc>;
    const data = this[_data];
    for (let i = 0; i < data.elements.length; i++) {
      if (_elem.uuid === data.elements[i]?.uuid) {
        data.elements[i] = _elem;
        break;
      }
    }
    this[_emitChangeData]();
    this[_draw]();
  }

  addElement(elem: TypeElementBase<keyof TypeElemDesc>): string | null {
    if (this[_onlyRender] === true) return null;
    const _elem = deepClone(elem);
    _elem.uuid = createUUID();
    this[_data].elements.push(_elem);
    this[_emitChangeData]();
    this[_draw]();
    return _elem.uuid;
  }

  deleteElement(uuid: string) {
    if (this[_onlyRender] === true) return;
    const index = this[_element].getElementIndex(this[_data], uuid);
    if (index >= 0) {
      this[_data].elements.splice(index, 1);
      this[_emitChangeData]();
      this[_draw]();
    }
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

  private [_initEvent](): void {
    if (this[_hasInited] === true) {
      return;
    }

    this[_board].on('hover', time.throttle(this[_handleHover].bind(this), 32));

    this[_board].on('point', time.throttle(this[_handleClick].bind(this), 16));
    if (this[_onlyRender] === true) {
      return;
    }
    this[_board].on('point', this[_handlePoint].bind(this));
    this[_board].on('moveStart', this[_handleMoveStart].bind(this));
    this[_board].on('move', time.throttle(this[_handleMove].bind(this), 16));
    this[_board].on('moveEnd', this[_handleMoveEnd].bind(this));
  }

  private [_handleClick](point: TypePoint): void {
    const [index, uuid] = this[_element].isPointInElement(point, this[_data]);
    if (index >= 0 && uuid) {
      this[_coreEvent].trigger(
        'screenClickElement', 
        { index, uuid, element: deepClone(this[_data].elements?.[index])}
      );
    }
    this[_draw]();
  }

  private [_handlePoint](point: TypePoint): void {
    if (!this[_mapper].isEffectivePoint(point)) {
      return;
    }
    if (this[_helper].isPointInElementList(point, this[_data])) {
      // Coontroll Element-List
      this[_mode] = Mode.SELECT_ELEMENT_LIST;
    } else {
      const [uuid, direction] = this[_helper].isPointInElementWrapperDot(point);
      if (uuid && direction) {
        // Controll Element-Wrapper
        this[_mode] = Mode.SELECT_ELEMENT_WRAPPER_DOT;
        this[_selectedDotDirection] = direction;
        this[_tempData].set('selectedUUID', uuid);
      } else {
        const [index, uuid] = this[_element].isPointInElement(point, this[_data]);
        if (index >= 0) {
          // Controll Element
          this.selectElementByIndex(index, { useMode: true });
          if (typeof uuid === 'string' && this[_coreEvent].has('screenSelectElement')) {
            this[_coreEvent].trigger(
              'screenSelectElement', 
              { index, uuid, element: deepClone(this[_data].elements?.[index])}
            );
            this[_emitChangeScreen]();
          }
          this[_mode] = Mode.SELECT_ELEMENT;
        } else {
          // Controll Area
          this[_tempData].set('selectedUUIDList', []);
          this[_mode] = Mode.SELECT_AREA;
        }
      }
    }
    
    this[_draw]();
  }

  private [_handleMoveStart](point: TypePoint): void {
    this[_prevPoint] = point;
    const uuid = this[_tempData].get('selectedUUID');

    if (this[_mode] === Mode.SELECT_ELEMENT_LIST) {
      // TODO
    } else if (this[_mode] === Mode.SELECT_ELEMENT) {
      if (typeof uuid === 'string' && this[_coreEvent].has('screenMoveElementStart')) {
        this[_coreEvent].trigger('screenMoveElementStart', {
          index: this[_element].getElementIndex(this[_data], uuid),
          uuid,
          x: point.x,
          y: point.y
        });
      } 
    } else if (this[_mode] === Mode.SELECT_AREA) {
      this[_helper].startSelectArea(point);
    }
  }

  private [_handleMove](point: TypePoint): void {
    if (this[_mode] === Mode.SELECT_ELEMENT_LIST) {
      this[_dragElements](this[_tempData].get('selectedUUIDList'), point, this[_prevPoint]);
      this[_draw]();
      this[_cursorStatus] = CursorStatus.DRAGGING;
    } else if (typeof this[_tempData].get('selectedUUID') === 'string') {
      if (this[_mode] === Mode.SELECT_ELEMENT) {
        this[_dragElements]([this[_tempData].get('selectedUUID') as string], point, this[_prevPoint]);
        this[_draw]();
        this[_cursorStatus] = CursorStatus.DRAGGING;
      } else if (this[_mode] === Mode.SELECT_ELEMENT_WRAPPER_DOT && this[_selectedDotDirection]) {
        this[_transfromElement](this[_tempData].get('selectedUUID') as string, point, this[_prevPoint], this[_selectedDotDirection] as TypeHelperWrapperDotDirection);
        this[_cursorStatus] = CursorStatus.DRAGGING;
      }
    } else if (this[_mode] === Mode.SELECT_AREA) {
      this[_helper].changeSelectArea(point);
      this[_draw]();
    }
    this[_prevPoint] = point;
  }

  private [_handleMoveEnd](point: TypePoint): void {
    const uuid = this[_tempData].get('selectedUUID');
    if (typeof uuid === 'string') {
      const index = this[_element].getElementIndex(this[_data], uuid);
      const elem = this[_data].elements[index];
      if (elem) {
        if (this[_coreEvent].has('screenMoveElementEnd')) {
          this[_coreEvent].trigger('screenMoveElementEnd', {
            index,
            uuid,
            x: point.x,
            y: point.y
          });
        }
        if (this[_coreEvent].has('screenChangeElement')) {
          this[_coreEvent].trigger('screenChangeElement', {
            index,
            uuid,
            width: elem.w,
            height: elem.h,
            angle: elem.angle || 0
          });
        }
        this[_emitChangeData]();
      }
    } else if (this[_mode] === Mode.SELECT_AREA) {
      const uuids = this[_helper].calcSelectedElements(this[_data]);
      if (uuids.length > 0) {
        this[_tempData].set('selectedUUIDList', uuids);
        this[_tempData].set('selectedUUID', null);
      } else {
        this[_mode] = Mode.NULL;
      }
      this[_helper].clearSelectedArea();
      this[_draw]();
    }
    
    if (this[_mode] !== Mode.SELECT_ELEMENT) {
      this[_tempData].set('selectedUUID', null);
    }

    this[_prevPoint] = null;
    this[_cursorStatus] = CursorStatus.NULL;
    this[_mode] = Mode.NULL;
  }

  private [_handleHover](point: TypePoint): void {
    let isMouseOverElement: boolean = false;
    
    if (this[_mode] === Mode.SELECT_AREA) {
      if (this[_onlyRender] !== true) this[_board].resetCursor();
    } else if (this[_cursorStatus] === CursorStatus.NULL) {
      const { cursor, elementUUID } = this[_mapper].judgePointCursor(point, this[_data]);
      if (this[_onlyRender] !== true) this[_board].setCursor(cursor);
      if (elementUUID) {
        const index: number | null = this[_helper].getElementIndexByUUID(elementUUID);
        if (index !== null && index >= 0) {
          const elem = this[_data].elements[index];
          if (this[_tempData].get('hoverUUID') !== elem.uuid) {
            const preIndex = this[_helper].getElementIndexByUUID(this[_tempData].get('hoverUUID') || '');
            if (preIndex !== null && this[_data].elements[preIndex]) {
              this[_coreEvent].trigger('mouseLeaveElement', {
                uuid: this[_tempData].get('hoverUUID'),
                index: preIndex,
                element: this[_data].elements[preIndex]
              });
            }
          }
          if (elem) {
            this[_coreEvent].trigger('mouseOverElement', { uuid: elem.uuid, index,  element: elem, });
            this[_tempData].set('hoverUUID', elem.uuid);
            isMouseOverElement = true;
          }
        }
      }
    }
    if (isMouseOverElement !== true && this[_tempData].get('hoverUUID') !== null) {
      const uuid = this[_tempData].get('hoverUUID');
      const index: number | null = this[_helper].getElementIndexByUUID(uuid || '');
      if (index !== null) this[_coreEvent].trigger('mouseLeaveElement', { uuid, index, element: this[_data].elements[index] })
      this[_tempData].set('hoverUUID', null); 
    }
  }

  private [_dragElements](uuids: string[], point: TypePoint, prevPoint: TypePoint|null): void {
    if (!prevPoint) {
      return;
    }
    uuids.forEach((uuid) => {
      const idx = this[_helper].getElementIndexByUUID(uuid);
      if (idx === null) return;
      const elem = this[_data].elements[idx];
      if (elem.lock !== true) {
        this[_element].dragElement(this[_data], uuid, point, prevPoint, this[_board].getContext().getTransform().scale);
      }
    });
    this[_draw]();
  }

  private [_transfromElement](
    uuid: string, point: TypePoint, prevPoint: TypePoint|null, direction: TypeHelperWrapperDotDirection
  ): null | {
    width: number,
    height: number,
    angle: number,
  } {
    if (!prevPoint) {
      return null;
    }
    const result = this[_element].transformElement(this[_data], uuid, point, prevPoint, this[_board].getContext().getTransform().scale, direction);
    this[_draw]();
    return result;
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
}

export default Core;