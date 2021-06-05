import {
  TypeData,
  TypePoint,
  TypeHelperWrapperDotDirection,
  TypeConfig,
  TypeConfigStrict,
  TypeElement,
  TypeElemDesc,
  TypeCoreOptions,
}  from '@idraw/types';
import Board from '@idraw/board';
import util from '@idraw/util';
import { Renderer } from './lib/renderer';
import { Element } from './lib/element';
import { Helper } from './lib/helper';
import { mergeConfig } from './lib/config';
import { CoreEvent, TypeCoreEventArgMap } from './lib/core-event';

const { time } = util;
const { deepClone } = util.data;
const { createUUID } = util.uuid;


enum Mode {
  NULL = 'null',
  SELECT_ELEMENT = 'select-element',
  SELECT_ELEMENT_WRAPPER_DOT = 'select-element-wrapper-dot',
  PAINTING = 'painting',
}

const _board = Symbol('_board');
const _data = Symbol('_data');
const _opts = Symbol('_opts');
const _config = Symbol('_config');
const _renderer = Symbol('_renderer');
const _element = Symbol('_element');
const _helper = Symbol('_helper');
const _hasInited = Symbol('_hasInited');
const _hasInitedData = Symbol('_hasInitedData');
const _mode = Symbol('_mode');
const _selectedUUID = Symbol('_selectedUUID');
const _prevPoint = Symbol('_prevPoint');
const _selectedDotDirection = Symbol('_selectedDotDirection');
const _coreEvent = Symbol('_coreEvent');

class Core {

  private [_board]: Board;
  private [_data]: TypeData;
  private [_opts]: TypeCoreOptions;
  private [_config]: TypeConfigStrict;
  private [_renderer]: Renderer;
  private [_element]: Element;
  private [_helper]: Helper;
  private [_hasInited] = false; 
  private [_hasInitedData] = false; 
  private [_mode]: Mode = Mode.NULL;
  private [_coreEvent]: CoreEvent = new CoreEvent();

  private [_selectedUUID]: string | null = null;
  private [_prevPoint]: TypePoint | null = null;
  private [_selectedDotDirection]: TypeHelperWrapperDotDirection | null = null;

  constructor(mount: HTMLDivElement, opts: TypeCoreOptions, config: TypeConfig) {
    this[_data] = { elements: [] };
    this[_opts] = opts;
    this[_config] = mergeConfig(config);
    this[_board] = new Board(mount, this[_opts]);
    this[_renderer] = new Renderer(this[_board]); 
    this[_element] = new Element(this[_board].getContext());
    this[_helper] = new Helper(this[_board].getContext(), this[_config]);
    this._initEvent();
    this[_hasInited] = true;
  }

  draw(): void {
    this[_helper].updateConfig(this[_data], {
      selectedUUID: this[_selectedUUID],
      devicePixelRatio: this[_opts].devicePixelRatio,
      scale: this[_board].getTransform().scale,
    });
    this[_renderer].render(this[_data], this[_helper].getConfig());
  }

  selectElement(index: number): void {
    if (this[_data].elements[index]) {
      const uuid = this[_data].elements[index].uuid;
      this[_mode] = Mode.SELECT_ELEMENT;
      this[_selectedUUID] = uuid;
      this.draw();
    }
  }

  selectElementByUUID(uuid: string): void {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0) {
      this.selectElement(index);
    }
  }

  moveUpElement(uuid: string): void {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0 && index < this[_data].elements.length - 1) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index + 1];
      this[_data].elements[index + 1] = temp;
    }
    this.draw();
  }

  moveDownElement(uuid: string): void {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index > 0 && index < this[_data].elements.length) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index - 1];
      this[_data].elements[index - 1] = temp;
    }
    this.draw();
  }

  scale(ratio: number): void {
    this[_board].scale(ratio);
    this. _emitChangeScreen();
  }

  scrollX(x: number): void {
    this[_board].scrollX(x);
    this. _emitChangeScreen();
  }

  scrollY(y: number): void {
    this[_board].scrollY(y);
    this. _emitChangeScreen();
  }

  getData(): TypeData {
    return deepClone(this[_data]);
  }

  initData(data: TypeData): void {
    if (this[_hasInitedData] === true) {
      return;
    }
    this.setData(data);
    this._emitChangeData();
    this[_hasInitedData] = true;
  }

  setData(data: TypeData): void {
    this[_data] = this[_element].initData(deepClone(data));
    this.draw();
  }

  updateElement(elem: TypeElement<keyof TypeElemDesc>) {
    const _elem  = deepClone(elem) as TypeElement<keyof TypeElemDesc>;
    const data = this[_data];
    for (let i = 0; i < data.elements.length; i++) {
      if (_elem.uuid === data.elements[i]?.uuid) {
        data.elements[i] = _elem;
        break;
      }
    }
    this._emitChangeData();
    this.draw();
  }

  addElement(elem: TypeElement<keyof TypeElemDesc>) {
    const _elem = deepClone(elem);
    _elem.uuid = createUUID();
    this[_data].elements.push(_elem);
    this._emitChangeData();
    this.draw();
  }

  deleteElement(uuid: string) {
    const index = this[_element].getElementIndex(this[_data], uuid);
    if (index >= 0) {
      this[_data].elements.splice(index, 1);
      this._emitChangeData();
      this.draw();
    }
  }

  on<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[_coreEvent].on(key, callback);
  }

  off<T extends keyof TypeCoreEventArgMap >(key: T, callback: (p: TypeCoreEventArgMap[T]) => void) {
    this[_coreEvent].off(key, callback);
  }

  private _initEvent(): void {
    if (this[_hasInited] === true) {
      return;
    }
    this[_board].on('point', this._handlePoint.bind(this));
    this[_board].on('moveStart', this._handleMoveStart.bind(this));
    this[_board].on('move', time.throttle(this._handleMove.bind(this), 16));
    this[_board].on('moveEnd', this._handleMoveEnd.bind(this));
  }

  private _handlePoint(point: TypePoint): void {

    const [uuid, direction] = this[_helper].isPointInElementWrapperDot(point);
    
    if (uuid && direction) {
      this[_mode] = Mode.SELECT_ELEMENT_WRAPPER_DOT;
      this[_selectedDotDirection] = direction;
      this[_selectedUUID] = uuid;
    } else {
      const [index] = this[_element].isPointInElement(point, this[_data]);
      this.selectElement(index);
      if (typeof uuid === 'string' && this[_coreEvent].has('screenSelectElement')) {
        this[_coreEvent].trigger(
          'screenSelectElement', 
          { index, uuid, element: deepClone(this[_data].elements?.[index])}
        );
        this. _emitChangeScreen();
      }
    }
    this.draw();
  }

  private _handleMoveStart(point: TypePoint): void {
    this[_prevPoint] = point;
    const uuid = this[_selectedUUID];
    if (typeof uuid === 'string' && this[_coreEvent].has('screenMoveElementStart')) {
      this[_coreEvent].trigger('screenMoveElementStart', {
        index: this[_element].getElementIndex(this[_data], uuid),
        uuid,
        x: point.x,
        y: point.y
      });
    }
  }

  private _handleMove(point: TypePoint): void {
    if (typeof this[_selectedUUID] === 'string') {
      if (this[_mode] === Mode.SELECT_ELEMENT) {
        this._dragElement(this[_selectedUUID] as string, point, this[_prevPoint]);
        this.draw();
      } else if (this[_mode] === Mode.SELECT_ELEMENT_WRAPPER_DOT && this[_selectedDotDirection]) {
        this._transfromElement(this[_selectedUUID] as string, point, this[_prevPoint], this[_selectedDotDirection] as TypeHelperWrapperDotDirection);
      }
    }
    this[_prevPoint] = point;
  }

  private _handleMoveEnd(point: TypePoint): void {
    const uuid = this[_selectedUUID];
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
        this._emitChangeData();
      }
    }
    this[_selectedUUID] = null;
    this[_prevPoint] = null;
  }

  private _dragElement(uuid: string, point: TypePoint, prevPoint: TypePoint|null): void {
    if (!prevPoint) {
      return;
    }
    this[_element].dragElement(this[_data], uuid, point, prevPoint, this[_board].getContext().getTransform().scale);
    this.draw();
  }

  private _transfromElement(
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
    this.draw();
    return result;
  }

  private _emitChangeScreen() {
    if (this[_coreEvent].has('changeScreen')) {
      this[_coreEvent].trigger('changeScreen', {
        ...this[_board].getTransform(),
        ...{
          selectedElementUUID: this[_selectedUUID]
        }
      })
    }
  }

  private _emitChangeData() {
    if (this[_coreEvent].has('changeData')) {
      this[_coreEvent].trigger('changeData', deepClone(this[_data]));
    }
  }
}

export default Core;