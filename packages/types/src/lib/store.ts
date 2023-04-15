import { Data } from './data';
import { ViewScaleInfo } from './view';

export type ActiveStore = ViewScaleInfo & {
  contextWidth: number;
  contextHeight: number;
  data: Data | null;
  selectedIndexs: number[];
  selectedUUIDs: string[];
  // scale: number;
  // offsetLeft: number;
  // offsetRight: number;
  // offsetTop: number;
  // offsetBottom: number;
};

export interface StoreSharer {
  getActiveStorage<T extends keyof ActiveStore>(key: T): ActiveStore[T];
  setActiveStorage<T extends keyof ActiveStore>(key: T, storage: ActiveStore[T]): void;
  getActiveStoreSnapshot(): ActiveStore;
  getSharedStorage(key: string): any;
  setSharedStorage(key: string, storage: any): void;
  getSharedStoreSnapshot(): Record<string, any>;
}
