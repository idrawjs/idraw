// import { TypeData, TypeHelperConfig, } from '@idraw/types';
// import util from '@idraw/util';
// import Board from '@idraw/board';
// import { drawContext } from './draw';

// const { requestAnimationFrame } = window;
// const { deepClone } = util.data;

// type QueueItem = { data: TypeData, helper: TypeHelperConfig };
// enum DrawStatus {
//   FREE = 'free',
//   DRAWING = 'drawing',
// }

// export class Renderer {

//   private _queue: QueueItem[] = [];
//   private _board: Board;
//   private _status: DrawStatus = DrawStatus.FREE; 

//   constructor(board: Board) {
//     this._board = board;
//   }

//   render(data: TypeData, helper: TypeHelperConfig): void {
//     const _data: QueueItem = deepClone({ data, helper }) as QueueItem;
//     this._queue.push(_data);
//     if (this._status === DrawStatus.FREE) {
//       this._status = DrawStatus.DRAWING;
//       this._drawFrame();
//     }
//   }

//   private _drawFrame() {
//     requestAnimationFrame(() => {
//       const item: QueueItem | undefined = this._queue.shift();
//       if (item) {
//         drawContext(this._board.getContext(), item.data, item.helper);
//         this._board.draw();
//         this._drawFrame();
//       } else {
//         this._status = DrawStatus.FREE
//       }
//     })
//   }
// }




import { TypeData, TypeHelperConfig, } from '@idraw/types';
import Board from '@idraw/board';
import { drawContext } from './draw';

export class Renderer {

  private _board: Board;  

  constructor(board: Board) {
    this._board = board;
  }

  render(data: TypeData, helper: TypeHelperConfig): void {
    drawContext(this._board.getContext(), data, helper);
    this._board.draw();
  }
}