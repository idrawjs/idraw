import { EventEmitter } from '@idraw/util';
import type { LoadItemMap } from '@idraw/types';
import { drawElementList, drawUnderlay } from './draw/index';
import { Loader } from './loader';
import type { Data, BoardRenderer, RendererOptions, RendererEventMap, RendererDrawOptions } from '@idraw/types';

export class Renderer extends EventEmitter<RendererEventMap> implements BoardRenderer {
  #opts: RendererOptions;
  #loader: Loader = new Loader();
  #hasDestroyed: boolean = false;

  constructor(opts: RendererOptions) {
    super();
    this.#opts = opts;
    this.#init();
  }

  isDestroyed() {
    return this.#hasDestroyed;
  }

  destroy() {
    this.clear();
    this.#opts = null as any;
    this.#loader.destroy();
    this.#loader = null as any;
    this.#hasDestroyed = true;
  }

  #init() {
    const loader = this.#loader;
    loader.on('load', (e) => {
      this.trigger('load', e);
    });
    loader.on('error', (e) => {
      // TODO
      // eslint-disable-next-line no-console
      console.error(e);
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
    if (data.underlay) {
      drawUnderlay(viewContext, data.underlay, {
        loader,
        calculator,
        parentElementSize,
        parentOpacity: 1,
        ...opts
      });
    }
    drawElementList(viewContext, data, {
      loader,
      calculator,
      parentElementSize,
      elementAssets: data.assets,
      parentOpacity: 1,
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

  setLoadItemMap(itemMap: LoadItemMap) {
    this.#loader.setLoadItemMap(itemMap);
  }

  getLoadItemMap(): LoadItemMap {
    return this.#loader.getLoadItemMap();
  }

  getLoader(): Loader {
    return this.#loader;
  }
}

export { drawRect } from './draw';
