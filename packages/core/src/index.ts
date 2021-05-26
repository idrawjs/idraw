import { TypeData, TypePoint } from '@idraw/types';
import Board from '@idraw/board';
import Renderer from './lib/renderer';
import { Element } from './lib/element';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Core {

  private _board: Board;
  private _data: TypeData;
  private _opts: Options;
  private _renderer: Renderer;
  private _element: Element;
  private _hasInited: boolean = false; 

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

  getData() {
    return this._data;
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

  setData(data: TypeData) {
    return this._data = data;
  }

  private _initEvent() {
    if (this._hasInited === true) {
      return;
    }
    // let prevPoint: TypePoint | null;
    let selectedIndex: number = -1;
    this._board.on('point', (p: TypePoint) => {
      selectedIndex = this._element.isPointInElement(p, this._data);
      console.log('selectedIndex =', selectedIndex);
    });
    // this._board.on('moveStart', (p) => {
    //   prevPoint = p;
    // });
    // this._board.on('move', (p) => {
    //   prevPoint = p;
    // });
    // this._board.on('moveEnd', (p) => {
    //   prevPoint = null;
    // })
  }
}

export default Core;