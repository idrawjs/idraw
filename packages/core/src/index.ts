import { TypeData } from '@idraw/types';
import Board from '@idraw/board';
import Renderer from './lib/renderer';

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

  constructor(mount: HTMLDivElement, opts: Options) {
    this._data = { elements: [] };
    this._opts = opts;
    this._board = new Board(mount, this._opts);
    this._renderer = new Renderer(this._board); 
  }

  draw() {
    this._renderer.render(this._data);
  }

  getData() {
    return this._data;
  }

  setData(data: TypeData) {
    return this._data = data;
  }
}

export default Core;