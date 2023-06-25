import { Data } from './data';
import { ViewScaleInfo, ViewSizeInfo } from './view';

export type ActiveStore = ViewSizeInfo &
  ViewScaleInfo & {
    data: Data | null;
  };

export interface StoreSharer<S extends Record<any, any> = any> {
  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T];
  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]): void;
  getActiveStoreSnapshot(): ActiveStore;
  getSharedStorage<K extends keyof S = string>(key: K): S[K];
  setSharedStorage<K extends keyof S = string>(key: K, storage: S[K]): void;
  getSharedStoreSnapshot(): Record<string, any>;

  getActiveScaleInfo(): ViewScaleInfo;
  setActiveScaleInfo(viewScaleInfo: ViewScaleInfo): void;
  setActiveViewSizeInfo(size: ViewSizeInfo): void;
  getActiveViewSizeInfo(): ViewSizeInfo;
}
