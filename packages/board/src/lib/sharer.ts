import type { ActiveStore, StoreSharer } from '@idraw/types';
import { Store } from '@idraw/util';

const defaultActiveStorage: ActiveStore = {
  contextWidth: 0,
  contextHeight: 0,
  data: null,
  selectedUUIDs: [] as string[],
  selectedIndexs: [] as number[],
  scale: 1,
  offsetLeft: 0,
  offsetRight: 0,
  offsetTop: 0,
  offsetBottom: 0
};

export class Sharer implements StoreSharer {
  private _activeStore: Store<ActiveStore>;
  private _sharedStore: Store<{
    [string: string]: any;
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

  drawFrame(): void {
    // TODO
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

  getSharedStorage(key: string): any {
    return this._sharedStore.get(key);
  }

  setSharedStorage(key: string, storage: any) {
    return this._sharedStore.set(key, storage);
  }

  getSharedStoreSnapshot(): Record<string, any> {
    return this._sharedStore.getSnapshot();
  }
}
