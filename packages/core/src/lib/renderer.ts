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
    this._loader = new Loader({
      board: board,
      maxParallelNum: 6
    });
    this._loader.on('load', (res) => {
      this._drawFrame();
    });
    this._loader.on('error', (res) => {
      console.log('Loader Error: ', res);
    });
    this._loader.on('complete', (res) => {
      // console.log('complete: ', res);
    });
  }

  render(data: TypeData, helper: TypeHelperConfig): void {
    const _data: QueueItem = deepClone({ data, helper }) as QueueItem;
    this._queue.push(_data);
    if (this._status !== DrawStatus.DRAWING) {
      this._status = DrawStatus.DRAWING;
      this._drawFrame();
    }
    this._loader.load(data);
  }

  private _drawFrame() {
    requestAnimationFrame(() => {
      const ctx = this._board.getContext();
      // console.log('------ render frame ------', this._loader.isComplete())
      
      let item: QueueItem | undefined = this._queue[0];
      let isLastFrame = false;
      if (this._queue.length > 1) {
        item = this._queue.shift();
      } else {
        isLastFrame = true;
      }
      if (this._loader.isComplete() !== true) {
        this._drawFrame();
        if (item) {
          drawContext(ctx, item.data, item.helper, this._loader);
          this._board.draw();
        }
      } else if (item) {
        drawContext(ctx, item.data, item.helper, this._loader);
        this._board.draw();
        this._retainQueueOneItem();
        if (!isLastFrame) {
          this._drawFrame();
        } else {
          this._status = DrawStatus.FREE;
        }
      } else {
        this._status = DrawStatus.FREE;
      }
    });
  }

  private _retainQueueOneItem() {
    if (this._queue.length <= 1) {
      return;
    }
    const lastOne = deepClone(this._queue[this._queue.length - 1]);
    this._queue = [lastOne];
  }

  
}

