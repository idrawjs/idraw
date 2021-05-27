import { TypeData, TypePoint } from '@idraw/types';
import Board from '@idraw/board';
import Renderer from './lib/renderer';
import { Element } from './lib/element';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

enum Mode {
  NULL = 'null',
  SELECT_ELEMENT = 'select-element',
  PAINTING = 'painting',
}

class Core {

  private _board: Board;
  private _data: TypeData;
  private _opts: Options;
  private _renderer: Renderer;
  private _element: Element;
  private _hasInited: boolean = false; 
  private _mode: Mode = Mode.NULL;

  private _selectedUUID: string | null = null;
  private _prevPoint: TypePoint | null = null;

  constructor(mount: HTMLDivElement, opts: Options) {
    this._data = { elements: [] };
    this._opts = opts;
    this._board = new Board(mount, this._opts);
    this._renderer = new Renderer(this._board); 
    this._element = new Element(this._board.getContext());
    this._initEvent();
    this._hasInited = true;
  }

  draw() {
    this._renderer.render(this._data);
  }

  selectElement(index: number) {
    console.log('index');
  }

  scale(ratio: number) {
    this._board.scale(ratio);
  }

  scrollX(x: number) {
    this._board.scrollX(x);
  }

  scrollY(y: number) {
    this._board.scrollY(y);
  }

  getData(): TypeData {
    return JSON.parse(JSON.stringify(this._data));
  }

  setData(data: TypeData) {
    return this._data = this._element.initData(data);
  }

  private _initEvent() {
    if (this._hasInited === true) {
      return;
    }
    this._board.on('point', this._handlePoint.bind(this));
    this._board.on('moveStart', this._handleMoveStart.bind(this));
    this._board.on('move', this._handleMove.bind(this));
    this._board.on('moveEnd', this._handleMoveEnd.bind(this));
  }

  private _handlePoint(point: TypePoint) {
    const [index, uuid] = this._element.isPointInElement(point, this._data);
    if (index >= 0) {
      this._mode = Mode.SELECT_ELEMENT;
      this._selectedUUID = uuid
    }
  }

  private _handleMoveStart(point: TypePoint) {
    this._prevPoint = point;
  }

  private _handleMove(point: TypePoint) {
    if (this._mode === Mode.SELECT_ELEMENT) {
      if (this._selectedUUID) {
        this._dragElement(this._selectedUUID, point, this._prevPoint);
      }
    }
    this._prevPoint = point;
    this.draw();
  }

  private _handleMoveEnd(point: TypePoint) {
    this._selectedUUID = null;
    this._prevPoint = null;
  }

  private _dragElement(uuid: string, point: TypePoint, prevPoint: TypePoint|null) {
    if (!prevPoint) {
      return;
    }
    this._element.dragElement(this._data, uuid, point, prevPoint, this._board.getContext().getTransform().scale);
    this.draw();
    prevPoint = point;
  }
}

export default Core;