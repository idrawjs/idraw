import { TypeData, TypeContext, TypeElement, TypeElemDesc } from '@idraw/types';
import { createUUID, deepClone, Context } from '@idraw/util';
import { drawContext } from './lib/draw';
import { TypeLoadDataItem } from './lib/loader-event';
import Loader from './lib/loader';
import { RendererEvent } from './lib/renderer-event';
import {
  _queue,
  _ctx,
  _status,
  _loader,
  _opts,
  _freeze,
  _drawFrame,
  _retainQueueOneItem
} from './names';

const { requestAnimationFrame } = window;

type QueueItem = { data: TypeData };
enum DrawStatus {
  NULL = 'null',
  FREE = 'free',
  DRAWING = 'drawing',
  FREEZE = 'freeze'
  // STOP = 'stop',
}

type Options = {
  width: number;
  height: number;
  contextWidth?: number;
  contextHeight?: number;
  devicePixelRatio: number;
};

export default class Renderer extends RendererEvent {
  private [_queue]: QueueItem[] = [];
  private [_ctx]: TypeContext | null = null;
  private [_status]: DrawStatus = DrawStatus.NULL;
  private [_loader]: Loader;
  private [_opts]?: Options;

  constructor(opts?: Options) {
    super();
    this[_opts] = opts;
    this[_loader] = new Loader({
      maxParallelNum: 6
    });
    this[_loader].on('load', (res: TypeLoadDataItem) => {
      this[_drawFrame]();
      this.trigger('load', { element: res.element });
    });
    this[_loader].on('error', (res: TypeLoadDataItem) => {
      this.trigger('error', { element: res.element, error: res.error });
    });
    this[_loader].on('complete', () => {
      this.trigger('loadComplete', { t: Date.now() });
    });
  }

  render(
    target: HTMLCanvasElement | TypeContext,
    originData: TypeData,
    opts?: {
      // forceUpdate?: boolean,
      changeResourceUUIDs?: string[];
    }
  ): void {
    // if ([DrawStatus.STOP, DrawStatus.FREEZE].includes(this[_status])) {
    //   return;
    // }
    // this[_status] = DrawStatus.FREE;

    const { changeResourceUUIDs = [] } = opts || {};
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
      // TODO
      if (
        this[_opts] &&
        Object.prototype.toString.call(target) === '[object HTMLCanvasElement]'
      ) {
        const { width, height, contextWidth, contextHeight, devicePixelRatio } =
          this[_opts] as Options;
        const canvas = target as HTMLCanvasElement;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        const ctx2d = canvas.getContext('2d') as CanvasRenderingContext2D;
        this[_ctx] = new Context(ctx2d, {
          width,
          height,
          contextWidth: contextWidth || width,
          contextHeight: contextHeight || height,
          devicePixelRatio
        });
      } else if (target) {
        // TODO
        this[_ctx] = target as TypeContext;
      }
    }

    if ([DrawStatus.FREEZE].includes(this[_status])) {
      return;
    }
    const _data: QueueItem = deepClone({ data }) as QueueItem;
    this[_queue].push(_data);
    // if (this[_status] !== DrawStatus.DRAWING) {
    //   this[_status] = DrawStatus.DRAWING;
    //   this[_drawFrame]();
    // }
    this[_drawFrame]();
    this[_loader].load(data, changeResourceUUIDs || []);
  }

  getContext(): TypeContext | null {
    return this[_ctx];
  }

  thaw() {
    this[_status] = DrawStatus.FREE;
  }

  private [_freeze]() {
    this[_status] = DrawStatus.FREEZE;
  }

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
          // this.trigger('drawFrame', { t: Date.now() })
        }
      } else if (item && ctx) {
        drawContext(ctx, item.data, this[_loader]);
        // this._board.draw();
        // this.trigger('drawFrame', { t: Date.now() })
        this[_retainQueueOneItem]();
        if (!isLastFrame) {
          this[_drawFrame]();
        } else {
          this[_status] = DrawStatus.FREE;
        }
      } else {
        this[_status] = DrawStatus.FREE;
      }
      this.trigger('drawFrame', { t: Date.now() });

      if (
        this[_loader].isComplete() === true &&
        this[_queue].length === 1 &&
        this[_status] === DrawStatus.FREE
      ) {
        if (ctx && this[_queue][0] && this[_queue][0].data) {
          drawContext(ctx, this[_queue][0].data, this[_loader]);
        }
        this.trigger('drawFrameComplete', { t: Date.now() });
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
