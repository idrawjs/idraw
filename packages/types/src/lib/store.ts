import { Data } from './data';
import { ViewScaleInfo, ViewSizeInfo } from './view';

export type ActiveStore = ViewSizeInfo &
  ViewScaleInfo & {
    data: Data | null;
    selectedIndexs: number[];
    selectedUUIDs: string[];
  };

export interface StoreSharer {
  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T];
  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]): void;
  getActiveStoreSnapshot(): ActiveStore;
  getSharedStorage(key: string): any;
  setSharedStorage(key: string, storage: any): void;
  getSharedStoreSnapshot(): Record<string, any>;
  getActiveScaleInfo(): ViewScaleInfo;
  setActiveScaleInfo(scaleInfo: ViewScaleInfo): void;
  setActiveViewSizeInfo(size: ViewSizeInfo): void;
  getActiveViewSizeInfo(): ViewSizeInfo;
}
