import { Data } from './data';
import { ViewScaleInfo, ViewSizeInfo } from './view';

export type ActiveStore = ViewSizeInfo &
  ViewScaleInfo & {
    data: Data | null;
    // selectedIndexes: Array<number | string>; // [0, '0.1.2.3']
    selectedUUIDs: string[];
  };

export interface StoreSharer<S extends Record<any, any>> {
  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T];
  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]): void;
  getActiveStoreSnapshot(): ActiveStore;
  getSharedStorage<K extends keyof S>(key: K): S[K];
  setSharedStorage<K extends keyof S>(key: K, storage: S[K]): void;
  getSharedStoreSnapshot(): Record<string, any>;

  getActiveScaleInfo(): ViewScaleInfo;
  setActiveScaleInfo(scaleInfo: ViewScaleInfo): void;
  setActiveViewSizeInfo(size: ViewSizeInfo): void;
  getActiveViewSizeInfo(): ViewSizeInfo;
}
