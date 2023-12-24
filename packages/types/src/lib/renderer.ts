import type { ViewScaleInfo, ViewCalculator, ViewSizeInfo } from './view';
import type { Element, ElementSize, ElementAssets } from './element';
import type { LoaderEventMap, LoadElementType, LoadContent, LoadItemMap } from './loader';
import type { UtilEventEmitter } from './util';
import type { StoreSharer } from './store';
import { ViewContext2D } from '@idraw/types';

export interface RendererOptions {
  viewContext: ViewContext2D;
  sharer?: StoreSharer;
  calculator?: ViewCalculator;
}

export interface RendererEvent {
  viewContext: ViewContext2D;
}

export interface RendererEventMap {
  load: LoaderEventMap['load'];
}

export interface RendererLoader extends UtilEventEmitter<LoaderEventMap> {
  // load(element: Element<LoadElementType>): void;
  load(element: Element<LoadElementType>, assets: ElementAssets): void;
  getContent(element: Element<LoadElementType>): LoadContent | null;
  getLoadItemMap(): LoadItemMap;
  setLoadItemMap(itemMap: LoadItemMap): void;
}

export interface RendererDrawOptions {
  viewSizeInfo: ViewSizeInfo;
  viewScaleInfo: ViewScaleInfo;
  forceDrawAll?: boolean;
}

export interface RendererDrawElementOptions extends RendererDrawOptions {
  loader: RendererLoader;
  calculator?: ViewCalculator;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
  parentElementSize: ElementSize;
  elementAssets?: ElementAssets;
}
