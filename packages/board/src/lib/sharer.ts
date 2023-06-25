import type { ActiveStore, StoreSharer, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { Store } from '@idraw/util';

const defaultActiveStorage: ActiveStore = {
  width: 0,
  height: 0,
  devicePixelRatio: 1,
  contextX: 0,
  contextY: 0,
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
  private _activeStore: Store<ActiveStore>;
  private _sharedStore: Store<{
    [string: string | number | symbol]: any;
  }>;

  constructor() {
    const activeStore = new Store<ActiveStore>({
      defaultStorage: defaultActiveStorage
    });
    const sharedStore = new Store({
      defaultStorage: {}
    });
    this._activeStore = activeStore;
    this._sharedStore = sharedStore;
  }

  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T] {
    return this._activeStore.get(key);
  }

  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]) {
    return this._activeStore.set(key, storage);
  }

  getActiveStoreSnapshot(): ActiveStore {
    return this._activeStore.getSnapshot();
  }

  getSharedStorage(key: string | number | symbol): any {
    return this._sharedStore.get(key);
  }

  setSharedStorage(key: string | number | symbol, storage: any) {
    return this._sharedStore.set(key, storage);
  }

  getSharedStoreSnapshot(): Record<string, any> {
    return this._sharedStore.getSnapshot();
  }

  // get/set active info

  getActiveScaleInfo(): ViewScaleInfo {
    const viewScaleInfo: ViewScaleInfo = {
      scale: this._activeStore.get('scale'),
      offsetTop: this._activeStore.get('offsetTop'),
      offsetBottom: this._activeStore.get('offsetBottom'),
      offsetLeft: this._activeStore.get('offsetLeft'),
      offsetRight: this._activeStore.get('offsetRight')
    };
    return viewScaleInfo;
  }

  setActiveScaleInfo(viewScaleInfo: ViewScaleInfo) {
    const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight } = viewScaleInfo;
    this._activeStore.set('scale', scale);
    this._activeStore.set('offsetTop', offsetTop);
    this._activeStore.set('offsetBottom', offsetBottom);
    this._activeStore.set('offsetLeft', offsetLeft);
    this._activeStore.set('offsetRight', offsetRight);
  }

  setActiveViewSizeInfo(size: ViewSizeInfo) {
    this._activeStore.set('width', size.width);
    this._activeStore.set('height', size.height);
    this._activeStore.set('devicePixelRatio', size.devicePixelRatio);
    this._activeStore.set('contextX', size.contextX);
    this._activeStore.set('contextY', size.contextY);
    this._activeStore.set('contextWidth', size.contextWidth);
    this._activeStore.set('contextHeight', size.contextHeight);
  }

  getActiveViewSizeInfo(): ViewSizeInfo {
    const sizeInfo: ViewSizeInfo = {
      width: this._activeStore.get('width'),
      height: this._activeStore.get('height'),
      devicePixelRatio: this._activeStore.get('devicePixelRatio'),
      contextX: this._activeStore.get('contextX'),
      contextY: this._activeStore.get('contextY'),
      contextWidth: this._activeStore.get('contextWidth'),
      contextHeight: this._activeStore.get('contextHeight')
    };
    return sizeInfo;
  }
}
