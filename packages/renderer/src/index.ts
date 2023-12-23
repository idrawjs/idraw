import { EventEmitter } from '@idraw/util';
import { drawElementList } from './draw/index';
import { Loader } from './loader';
import type { Data, BoardRenderer, RendererOptions, RendererEventMap, RendererDrawOptions } from '@idraw/types';

export class Renderer extends EventEmitter<RendererEventMap> implements BoardRenderer {
  #opts: RendererOptions;
  #loader: Loader = new Loader();
  // private _draftContextTop: CanvasRenderingContext2D;
  // private _draftContextMiddle: CanvasRenderingContext2D;
  // private _draftContextBottom: CanvasRenderingContext2D;

  constructor(opts: RendererOptions) {
    super();
    this.#opts = opts;
    // const { width, height } = this.#opts.boardContent.viewContext.canvas;
    // this._draftContextTop = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;
    // this._draftContextMiddle = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;
    // this._draftContextBottom = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;

    this.#init();
  }

  #init() {
    const loader = this.#loader;
    loader.on('load', (e) => {
      this.trigger('load', e);
    });
    loader.on('error', () => {
      // TODO
    });
  }

  updateOptions(opts: RendererOptions) {
    this.#opts = opts;
  }

  drawData(data: Data, opts: RendererDrawOptions) {
    const loader = this.#loader;
    const { calculator } = this.#opts;
    const viewContext = this.#opts.viewContext;
    viewContext.clearRect(0, 0, viewContext.canvas.width, viewContext.canvas.height);
    const parentElementSize = {
      x: 0,
      y: 0,
      w: opts.viewSizeInfo.width,
      h: opts.viewSizeInfo.height
    };
    drawElementList(viewContext, data, {
      loader,
      calculator,
      parentElementSize,
      elementAssets: data.assets,
      ...opts
    });
  }

  scale(num: number) {
    const { sharer } = this.#opts;
    if (!sharer) {
      // TODO
      return;
    }
    const { data, offsetTop, offsetBottom, offsetLeft, offsetRight, width, height, contextHeight, contextWidth, devicePixelRatio } =
      sharer.getActiveStoreSnapshot();
    if (data) {
      this.drawData(data, {
        viewScaleInfo: {
          scale: num,
          offsetTop,
          offsetBottom,
          offsetLeft,
          offsetRight
        },
        viewSizeInfo: {
          width,
          height,
          contextHeight,
          contextWidth,
          devicePixelRatio
        }
      });
    }
  }
}
