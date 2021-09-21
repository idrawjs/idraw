import { TypeData, TypeHelperConfig, } from '@idraw/types';
import util from '@idraw/util';
import Board from '@idraw/board';
import { drawContext } from './draw';
import Loader from './loader';
import { RendererEvent } from './renderer-event';

const { requestAnimationFrame } = window;
const { deepClone } = util.data;

type QueueItem = { data: TypeData, helper: TypeHelperConfig };
enum DrawStatus {
  NULL = 'null',
  FREE = 'free',
  DRAWING = 'drawing',
  FREEZE = 'freeze',
  // STOP = 'stop',
}

export class Renderer extends RendererEvent {

  private _queue: QueueItem[] = [];
  private _board: Board;
  private _status: DrawStatus = DrawStatus.NULL; 
  private _loader: Loader;

  constructor(board: Board) {
    super();
    this._board = board;
    this._loader = new Loader({
      board: board,
      maxParallelNum: 6
    });
    this._loader.on('load', (res) => {
      this._drawFrame();
      // console.log('Load: ', res);
    });
    this._loader.on('error', (res) => {
      console.log('Loader Error: ', res);
    });
    this._loader.on('complete', (res) => {
      // console.log('complete: ', res);
    });
  }

  freeze() {
    this._status = DrawStatus.FREEZE;
  }

  thaw() {
    this._status = DrawStatus.FREE;
  }
  
  // stop() {
  //   this._status = DrawStatus.STOP;
  // }

  // restart() {
  //   this._status = DrawStatus.NULL;
  // }

  render(data: TypeData, helper: TypeHelperConfig, changeResourceUUIDs: string[]): void { 
    // if ([DrawStatus.STOP, DrawStatus.FREEZE].includes(this._status)) {
    //   return;
    // }
    if ([DrawStatus.FREEZE].includes(this._status)) {
      return;
    }
    const _data: QueueItem = deepClone({ data, helper }) as QueueItem;
    this._queue.push(_data);
    if (this._status !== DrawStatus.DRAWING) {
      this._status = DrawStatus.DRAWING;
      this._drawFrame();
    }
    this._loader.load(data, changeResourceUUIDs);
  }

  private _drawFrame() {
    if (this._status === DrawStatus.FREEZE) {
      return;
    }
    requestAnimationFrame(() => {
      if (this._status === DrawStatus.FREEZE) {
        return;
      }
      const ctx = this._board.getContext();
      
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
      this.trigger('drawFrame', undefined)

      if (this._loader.isComplete() === true && this._queue.length === 1 && this._status === DrawStatus.FREE) {
        this.trigger('drawFrameComplete', undefined);
        this.freeze();
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

