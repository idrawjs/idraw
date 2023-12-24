import type { ElementType, Element, ElementAssets } from './element';

export type LoadElementType = 'image' | 'svg' | 'html';

export interface LoadItem {
  element: Element<LoadElementType>;
  status: 'null' | 'load' | 'error';
  content: LoadContent | null;
  startTime: number;
  endTime: number;
  error?: any;
  source: string | null;
}

export interface LoadItemMap {
  [assetId: string]: LoadItem;
}

export interface LoaderEvent extends LoadItem {
  countTime: number;
}

export interface LoaderEventMap {
  load: LoaderEvent;
  error: LoaderEvent;
}

export interface LoadResult<C> {
  uuid: string;
  lastModified: number;
  content: C;
}

export type LoadContent = HTMLImageElement | HTMLCanvasElement;

export type LoadFunc<T extends ElementType, C extends LoadContent> = (element: Element<T>, assets: ElementAssets) => Promise<LoadResult<C>>;
