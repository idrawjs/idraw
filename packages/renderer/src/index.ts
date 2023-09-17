import { EventEmitter } from '@idraw/util';
import { drawElementList } from './draw/index';
import { Loader } from './loader';
import type { Data, BoardRenderer, RendererOptions, RendererEventMap, RendererDrawOptions } from '@idraw/types';

export class Renderer extends EventEmitter<RendererEventMap> implements BoardRenderer {
  private _opts: RendererOptions;
  private _loader: Loader = new Loader();
  // private _draftContextTop: CanvasRenderingContext2D;
  // private _draftContextMiddle: CanvasRenderingContext2D;
  // private _draftContextBottom: CanvasRenderingContext2D;

  constructor(opts: RendererOptions) {
    super();
    this._opts = opts;
    // const { width, height } = this._opts.viewContent.viewContext.canvas;
    // this._draftContextTop = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;
    // this._draftContextMiddle = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;
    // this._draftContextBottom = createOffscreenContext2D({ width, height }) as CanvasRenderingContext2D;

    this._init();
  }

  private _init() {
    const { _loader: loader } = this;
    loader.on('load', (e) => {
      this.trigger('load', e);
    });
    loader.on('error', () => {
      // TODO
    });
  }

  updateOptions(opts: RendererOptions) {
    this._opts = opts;
  }

  drawData(data: Data, opts: RendererDrawOptions) {
    const { _loader: loader } = this;
    const { calculator } = this._opts;
    const { viewContext } = this._opts.viewContent;
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
    const { sharer } = this._opts;
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

  // scroll(opts: { offsetTop?: number; offsetLeft?: number }) {
  //   const { sharer } = this._opts;
  //   const { data, scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = sharer.getActiveStoreSnapshot();
  //   // TODO calc offset data
  //   if (data) {
  //     this.drawData(data, {
  //       scale,
  //       offsetTop,
  //       offsetBottom,
  //       offsetLeft,
  //       offsetRight
  //     });
  //   }
  //   // sharer.setActiveStorage('scale', num);
  // }
}
