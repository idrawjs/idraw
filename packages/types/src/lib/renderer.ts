import type { ViewContent, ViewScaleInfo, ViewCalculator, ViewSizeInfo } from './view';
import type { Element, ElementSize } from './element';
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
  load(element: Element<LoadElementType>): void;
  getContent(uuid: string): LoadContent | null;
}

export interface RendererDrawOptions {
  viewSize: ViewSizeInfo;
  scaleInfo: ViewScaleInfo;
}

export interface RendererDrawElementOptions extends RendererDrawOptions {
  loader: RendererLoader;
  calculator: ViewCalculator;
  scaleInfo: ViewScaleInfo;
  viewSize: ViewSizeInfo;
  parentElementSize: ElementSize;
}
