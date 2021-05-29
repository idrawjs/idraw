import { TypeData, TypePoint, TypeHelperWrapperDotDirection, TypeConfig, TypeConfigStrict } from '@idraw/types';
import Board from '@idraw/board';
import Renderer from './lib/renderer';
import { Element } from './lib/element';
import { Helper } from './lib/helper';
import { mergeConfig } from './lib/config';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

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
const _mode = Symbol('_mode');
const _selectedUUID = Symbol('_selectedUUID');
const _prevPoint = Symbol('_prevPoint');
const _selectedDotDirection = Symbol('_selectedDotDirection');

class Core {

  private [_board]: Board;
  private [_data]: TypeData;
  private [_opts]: Options;
  private [_config]: TypeConfigStrict;
  private [_renderer]: Renderer;
  private [_element]: Element;
  private [_helper]: Helper;
  private [_hasInited]: boolean = false; 
  private [_mode]: Mode = Mode.NULL;

  private [_selectedUUID]: string | null = null;
  private [_prevPoint]: TypePoint | null = null;
  private [_selectedDotDirection]: TypeHelperWrapperDotDirection | null = null;

  constructor(mount: HTMLDivElement, opts: Options, config: TypeConfig) {
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

  draw() {
    this[_helper].updateConfig(this[_data], {
      selectedUUID: this[_selectedUUID],
      devicePixelRatio: this[_opts].devicePixelRatio,
      scale: this[_board].getTransform().scale // TODO
    });
    this[_renderer].render(this[_data], this[_helper].getConfig());
  }

  selectElement(index: number) {
    if (this[_data].elements[index]) {
      const uuid = this[_data].elements[index].uuid;
      this[_mode] = Mode.SELECT_ELEMENT;
      this[_selectedUUID] = uuid;
      this.draw();
    }
  }

  selectElementByUUID(uuid: string) {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0) {
      this.selectElement(index);
    }
  }

  moveUpElement(uuid: string) {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index >= 0 && index < this[_data].elements.length - 1) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index + 1];
      this[_data].elements[index + 1] = temp;
    }
    this.draw();
  }

  moveDownElement(uuid: string) {
    const index = this[_helper].getElementIndexByUUID(uuid);
    if (typeof index === 'number' && index > 0 && index < this[_data].elements.length) {
      const temp = this[_data].elements[index];
      this[_data].elements[index] = this[_data].elements[index - 1];
      this[_data].elements[index - 1] = temp;
    }
    this.draw();
  }

  scale(ratio: number) {
    this[_board].scale(ratio);
  }

  scrollX(x: number) {
    this[_board].scrollX(x);
  }

  scrollY(y: number) {
    this[_board].scrollY(y);
  }

  getData(): TypeData {
    return JSON.parse(JSON.stringify(this[_data]));
  }

  setData(data: TypeData) {
    return this[_data] = this[_element].initData(data);
  }

  private _initEvent() {
    if (this[_hasInited] === true) {
      return;
    }
    this[_board].on('point', this._handlePoint.bind(this));
    this[_board].on('moveStart', this._handleMoveStart.bind(this));
    this[_board].on('move', this._handleMove.bind(this));
    this[_board].on('moveEnd', this._handleMoveEnd.bind(this));
  }

  private _handlePoint(point: TypePoint) {

    // console.log('handlePoint = ', point);

    const [uuid, direction] = this[_helper].isPointInElementWrapperDot(point);
    console.log('uuid, direction =', uuid, direction);
    
    if (uuid && direction) {
      this[_mode] = Mode.SELECT_ELEMENT_WRAPPER_DOT;
      this[_selectedDotDirection] = direction;
      this[_selectedUUID] = uuid;
    } else {
      const [index] = this[_element].isPointInElement(point, this[_data]);
      // console.log('index ===', index);
      this.selectElement(index);
    }
    // console.log('this[_mode] =', this[_mode], point)
  }

  private _handleMoveStart(point: TypePoint) {
    this[_prevPoint] = point;
  }

  private _handleMove(point: TypePoint) {
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

  private _handleMoveEnd(point: TypePoint) {
    this[_selectedUUID] = null;
    this[_prevPoint] = null;
  }

  private _dragElement(uuid: string, point: TypePoint, prevPoint: TypePoint|null) {
    if (!prevPoint) {
      return;
    }
    this[_element].dragElement(this[_data], uuid, point, prevPoint, this[_board].getContext().getTransform().scale);
    this.draw();
  }

  private _transfromElement(uuid: string, point: TypePoint, prevPoint: TypePoint|null, direction: TypeHelperWrapperDotDirection) {
    if (!prevPoint) {
      return;
    }
    this[_element].transformElement(this[_data], uuid, point, prevPoint, this[_board].getContext().getTransform().scale, direction);
    this.draw();
  }
}

export default Core;