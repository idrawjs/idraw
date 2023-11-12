import type { ViewContent, ViewScaleInfo, ViewCalculator, ViewSizeInfo } from './view';
import type { Element, ElementSize, ElementAssets } from './element';
import type { LoaderEventMap, LoadElementType, LoadContent } from './loader';
import type { UtilEventEmitter } from './util';
import type { StoreSharer } from './store';

export interface RendererOptions {
  viewContent: ViewContent;
  sharer: StoreSharer;
  calculator: ViewCalculator;
}

export interface RendererEvent {
  viewContext: ViewContent['viewContext'];
}

export interface RendererEventMap {
  load: LoaderEventMap['load'];
}

export interface RendererLoader extends UtilEventEmitter<LoaderEventMap> {
  // load(element: Element<LoadElementType>): void;
  load(element: Element<LoadElementType>, assets: ElementAssets): void;
  getContent(element: Element<LoadElementType>): LoadContent | null;
}

export interface RendererDrawOptions {
  viewSizeInfo: ViewSizeInfo;
  viewScaleInfo: ViewScaleInfo;
}

export interface RendererDrawElementOptions extends RendererDrawOptions {
  loader: RendererLoader;
  calculator: ViewCalculator;
  viewScaleInfo: ViewScaleInfo;
  viewSizeInfo: ViewSizeInfo;
  parentElementSize: ElementSize;
  elementAssets?: ElementAssets;
}
