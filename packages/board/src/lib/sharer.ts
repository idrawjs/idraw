import type { ActiveStore, StoreSharer, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { Store } from '@idraw/util';

const defaultActiveStorage: ActiveStore = {
  width: 0,
  height: 0,
  devicePixelRatio: 1,
  contextWidth: 0,
  contextHeight: 0,
  data: null,
  scale: 1,
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetBottom: 0
};

export class Sharer implements StoreSharer<Record<string | number | symbol, any>> {
  #activeStore: Store<ActiveStore>;
  #sharedStore: Store<{
    [string: string | number | symbol]: any;
  }>;

  constructor() {
    const activeStore = new Store<ActiveStore>({
      defaultStorage: defaultActiveStorage
    });
    const sharedStore = new Store({
      defaultStorage: {}
    });
    this.#activeStore = activeStore;
    this.#sharedStore = sharedStore;
  }

  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T] {
    return this.#activeStore.get(key);
  }

  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]) {
    return this.#activeStore.set(key, storage);
  }

  getActiveStoreSnapshot(): ActiveStore {
    return this.#activeStore.getSnapshot();
  }

  getSharedStorage(key: string | number | symbol): any {
    return this.#sharedStore.get(key);
  }

  setSharedStorage(key: string | number | symbol, storage: any) {
    return this.#sharedStore.set(key, storage);
  }

  getSharedStoreSnapshot(): Record<string, any> {
    return this.#sharedStore.getSnapshot();
  }

  // get/set active info

  getActiveViewScaleInfo(): ViewScaleInfo {
    const viewScaleInfo: ViewScaleInfo = {
      scale: this.#activeStore.get('scale'),
      offsetTop: this.#activeStore.get('offsetTop'),
      offsetBottom: this.#activeStore.get('offsetBottom'),
      offsetLeft: this.#activeStore.get('offsetLeft'),
      offsetRight: this.#activeStore.get('offsetRight')
    };
    return viewScaleInfo;
  }

  setActiveViewScaleInfo(viewScaleInfo: ViewScaleInfo) {
    const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
    this.#activeStore.set('scale', scale);
    this.#activeStore.set('offsetTop', offsetTop);
    this.#activeStore.set('offsetBottom', offsetBottom);
    this.#activeStore.set('offsetLeft', offsetLeft);
    this.#activeStore.set('offsetRight', offsetRight);
  }

  setActiveViewSizeInfo(size: ViewSizeInfo) {
    this.#activeStore.set('width', size.width);
    this.#activeStore.set('height', size.height);
    this.#activeStore.set('devicePixelRatio', size.devicePixelRatio);
    this.#activeStore.set('contextWidth', size.contextWidth);
    this.#activeStore.set('contextHeight', size.contextHeight);
  }

  getActiveViewSizeInfo(): ViewSizeInfo {
    const sizeInfo: ViewSizeInfo = {
      width: this.#activeStore.get('width'),
      height: this.#activeStore.get('height'),
      devicePixelRatio: this.#activeStore.get('devicePixelRatio'),
      contextWidth: this.#activeStore.get('contextWidth'),
      contextHeight: this.#activeStore.get('contextHeight')
    };
    return sizeInfo;
  }
}
