import { Data } from './data';
import {
  // ViewRectVertexes,
  ViewScaleInfo,
  ViewSizeInfo
} from './view';

export type ActiveStore = ViewSizeInfo &
  ViewScaleInfo & {
    data: Data | null;
    // selectedViewRectVertexes: ViewRectVertexes | null;
  };

export interface StoreSharer<S extends Record<any, any> = any> {
  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T];
  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]): void;
  getActiveStoreSnapshot(opts?: { deepClone?: boolean }): ActiveStore;
  getSharedStorage<K extends keyof S = string>(key: K): S[K];
  setSharedStorage<K extends keyof S = string>(key: K, storage: S[K]): void;
  getSharedStoreSnapshot(opts?: { deepClone?: boolean }): Record<string, any>;

  getActiveViewScaleInfo(): ViewScaleInfo;
  setActiveViewScaleInfo(viewScaleInfo: ViewScaleInfo): void;
  setActiveViewSizeInfo(size: ViewSizeInfo): void;
  getActiveViewSizeInfo(): ViewSizeInfo;
}
