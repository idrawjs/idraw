import { TypeData, TypeContext, TypeElement, TypeElemDesc } from '@idraw/types';
import util from '@idraw/util';
import { drawContext } from './lib/draw';
import Loader from './lib/loader';
import { RendererEvent } from './lib/renderer-event';
import {
  _queue, _ctx, _status, _loader, _opts, _freeze,
  _drawFrame, _retainQueueOneItem
} from './names';

const { Context } = util;
const { requestAnimationFrame } = window;
const { createUUID } = util.uuid;
const { deepClone } = util.data;

type QueueItem = { data: TypeData };
enum DrawStatus {
  NULL = 'null',
  FREE = 'free',
  DRAWING = 'drawing',
  FREEZE = 'freeze',
  // STOP = 'stop',
}

type Options = {
  width: number,
  height: number,
  contextWidth?: number;
  contextHeight?: number;
  devicePixelRatio: number,
}

export default class Renderer extends RendererEvent {

  private [_queue]: QueueItem[] = [];
  private [_ctx]: TypeContext | null = null;
  private [_status]: DrawStatus = DrawStatus.NULL; 
  private [_loader]: Loader;
  private [_opts]: Options;

  constructor(opts: Options) {
    super();
    this[_opts] = opts;
    this[_loader] = new Loader({
      maxParallelNum: 6
    });
    this[_loader].on('load', (res) => {
      this[_drawFrame]();
      // console.log('Load: ', res);
    });
    this[_loader].on('error', (res) => {
      console.log('Loader Error: ', res);
    });
    this[_loader].on('complete', (res) => {
      // console.log('complete: ', res);
    });
  }

  render(canvas: HTMLCanvasElement, originData: TypeData, opts?: {
    // forceUpdate?: boolean,
    changeResourceUUIDs?: string[]
  }): void { 
    // if ([DrawStatus.STOP, DrawStatus.FREEZE].includes(this[_status])) {
    //   return;
    // }
    // this[_status] = DrawStatus.FREE;

    const { changeResourceUUIDs = []} = opts || {};
    this[_status] = DrawStatus.FREE;

    const data = deepClone(originData);
    if (Array.isArray(data.elements)) {
      data.elements.forEach((elem: TypeElement<keyof TypeElemDesc>) => {
        if (!(typeof elem.uuid === 'string' && elem.uuid)) {
          elem.uuid = createUUID();
        }
      });
    }

    if (!this[_ctx]) {
      const { width, height, contextWidth, contextHeight, devicePixelRatio } = this[_opts];
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      const ctx2d = canvas.getContext('2d') as CanvasRenderingContext2D;
      this[_ctx] = new Context(ctx2d, {
        width,
        height,
        contextWidth: contextWidth || width,
        contextHeight: contextHeight || height,
        devicePixelRatio
      })
    }
    
    if ([DrawStatus.FREEZE].includes(this[_status])) {
      return;
    }
    const _data: QueueItem = deepClone({ data, }) as QueueItem;
    this[_queue].push(_data);
    // if (this[_status] !== DrawStatus.DRAWING) {
    //   this[_status] = DrawStatus.DRAWING;
    //   this[_drawFrame]();
    // }
    this[_drawFrame]();
    this[_loader].load(data, changeResourceUUIDs || []);
  }

  private [_freeze]() {
    this[_status] = DrawStatus.FREEZE;
  }

  // private _thaw() {
  //   this[_status] = DrawStatus.FREE;
  // }

  private [_drawFrame]() {
    if (this[_status] === DrawStatus.FREEZE) {
      return;
    }
    requestAnimationFrame(() => {
      if (this[_status] === DrawStatus.FREEZE) {
        return;
      }
      const ctx = this[_ctx];
      
      let item: QueueItem | undefined = this[_queue][0];
      let isLastFrame = false;
      if (this[_queue].length > 1) {
        item = this[_queue].shift();
      } else {
        isLastFrame = true;
      }
      if (this[_loader].isComplete() !== true) {
        this[_drawFrame]();
        if (item && ctx) {
          drawContext(ctx, item.data, this[_loader]);
          // this._board.draw();
        }
      } else if (item && ctx) {
        drawContext(ctx, item.data, this[_loader]);
        // this._board.draw();
        this[_retainQueueOneItem]();
        if (!isLastFrame) {
          this[_drawFrame]();
        } else {
          this[_status] = DrawStatus.FREE;
        }
      } else {
        this[_status] = DrawStatus.FREE;
      }
      this.trigger('drawFrame', undefined)

      if (this[_loader].isComplete() === true && this[_queue].length === 1 && this[_status] === DrawStatus.FREE) {
        this.trigger('drawFrameComplete', undefined);
        this[_freeze]();
      }
    });
  }

  private [_retainQueueOneItem]() {
    if (this[_queue].length <= 1) {
      return;
    }
    const lastOne = deepClone(this[_queue][this[_queue].length - 1]);
    this[_queue] = [lastOne];
  }

  
}

