import { TypeData } from '@idraw/types';
import Board from '@idraw/board';

type Options = {
  width: number;
  height: number;
  devicePixelRatio: number;
}

class Core {

  private _board: Board;
  private _data: TypeData;
  private _opts: Options;

  constructor(mount: HTMLDivElement, opts: Options) {
    this._data = { elements: [] };
    this._opts = opts;
    this._board = new Board(mount, this._opts);
  }

  draw() {
    const board = this._board;
    const ctx = board.getContext();
    const data = this.getData();
    const { width, height } = this._opts;
    board.clear();
    ctx.clearRect(0, 0, width, height);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, width, height);
    data.elements.forEach(ele => {
      // @ts-ignore
      if (ele.type === 'rect' && typeof ele.desc.color === 'string') {
        // @ts-ignore
        ctx.setFillStyle(ele.desc.color);
      }
      ctx.fillRect(ele.x, ele.y, ele.w, ele.h);
    });
    board.draw();
  }

  getData() {
    return this._data;
  }

  setData(data: TypeData) {
    return this._data = data;
  }
}

export default Core;