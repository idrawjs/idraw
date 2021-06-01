import { TypeData, TypeHelperConfig, } from '@idraw/types';
import util from '@idraw/util';
import Board from '@idraw/board';
import { drawContext } from './draw';
import Loader from './loader';

const { requestAnimationFrame } = window;
const { deepClone } = util.data;

type QueueItem = { data: TypeData, helper: TypeHelperConfig };
enum DrawStatus {
  FREE = 'free',
  DRAWING = 'drawing',
}

export class Renderer {

  private _queue: QueueItem[] = [];
  private _board: Board;
  private _status: DrawStatus = DrawStatus.FREE; 
  private _loader: Loader;

  constructor(board: Board) {
    this._board = board;
    this._loader = new Loader({ maxParallelNum: 6 });
    // TODO
    this._loader.on('load', (res) => {
      console.log('load: ', res);
    });
    this._loader.on('error', (res) => {
      console.log('error: ', res);
    });
    this._loader.on('complete', (res) => {
      console.log('complete: ', res);
    })
  }

  render(data: TypeData, helper: TypeHelperConfig): void {
    const _data: QueueItem = deepClone({ data, helper }) as QueueItem;
    this._queue.push(_data);
    if (this._status !== DrawStatus.DRAWING) {
      this._status = DrawStatus.DRAWING;
      this._drawFrame();
      this._loader.load(data);
    }
  }

  private _drawFrame() {
    requestAnimationFrame(() => {
      let item: QueueItem | undefined = this._queue[0];
      if (this._queue.length > 1) {
        item = this._queue.shift();
      }
      if (this._loader.isComplete() !== true) {
        this._drawFrame();
      } else if (item) {
        drawContext(this._board.getContext(), item.data, item.helper, this._loader);
        this._board.draw();
        this._retainQueueOneItem();
        this._drawFrame();
      } else {
        this._status = DrawStatus.FREE
      }
    })
  }

  private _retainQueueOneItem() {
    if (this._queue.length <= 1) {
      return;
    }
    const lastOne = deepClone(this._queue[this._queue.length - 1]);
    this._queue = [lastOne];
  }
}




// import { TypeData, TypeHelperConfig, } from '@idraw/types';
// import Board from '@idraw/board';
// import { drawContext } from './draw';

// export class Renderer {

//   private _board: Board;  

//   constructor(board: Board) {
//     this._board = board;
//   }

//   render(data: TypeData, helper: TypeHelperConfig): void {
//     drawContext(this._board.getContext(), data, helper);
//     this._board.draw();
//   }
// }