import type { Point } from './point';
import type { ViewContent, ViewCalculator, ViewScaleInfo, ViewSizeInfo } from './view';
import type { UtilEventEmitter } from './util';
import type { ActiveStore, StoreSharer } from './store';
import type { RendererEventMap, RendererOptions, RendererDrawOptions } from './renderer';
import type { Data } from './data';

export interface BoardWatcherPointEvent {
  point: Point;
}

export interface BoardWatherWheelXEvent {
  deltaX: number;
  point: Point;
}
export interface BoardWatherWheelYEvent {
  deltaY: number;
  point: Point;
}

export interface BoardWatherDrawFrameEvent<S extends Record<any | symbol, any>> {
  snapshot: BoardViewerFrameSnapshot<S>;
}

export type BoardWatherScaleEvent = ViewScaleInfo;

export type BoardWatherScrollXEvent = ViewScaleInfo;

export type BoardWatherScrollYEvent = ViewScaleInfo;

export type BoardWatherResizeEvent = ViewSizeInfo;

export interface BoardWatcherEventMap<S extends Record<any | symbol, any> = any> {
  hover: BoardWatcherPointEvent;
  pointStart: BoardWatcherPointEvent;
  pointMove: BoardWatcherPointEvent;
  pointEnd: BoardWatcherPointEvent;
  pointLeave: BoardWatcherPointEvent;
  doubleClick: BoardWatcherPointEvent;
  wheelX: BoardWatherWheelXEvent;
  wheelY: BoardWatherWheelYEvent;
  scale: BoardWatherScaleEvent;
  scrollX: BoardWatherScrollXEvent;
  scrollY: BoardWatherScrollYEvent;
  resize: BoardWatherResizeEvent;
  beforeDrawFrame: BoardWatherDrawFrameEvent<S>;
  afterDrawFrame: BoardWatherDrawFrameEvent<S>;
}

export type BoardMode = 'SELECT' | 'SCROLL' | 'RULE' | 'CONNECT' | 'PENCIL' | 'PEN' | string;

export interface BoardMiddlewareObject<S extends Record<any | symbol, any> = any> {
  mode: BoardMode;
  isDefault?: boolean;
  created?: () => void;
  // action
  hover?: (e: BoardWatcherEventMap<S>['hover']) => void | boolean;
  pointStart?: (e: BoardWatcherEventMap<S>['pointStart']) => void | boolean;
  pointMove?: (e: BoardWatcherEventMap<S>['pointMove']) => void | boolean;
  pointEnd?: (e: BoardWatcherEventMap<S>['pointEnd']) => void | boolean;
  pointLeave?: (e: BoardWatcherEventMap<S>['pointLeave']) => void | boolean;
  doubleClick?: (e: BoardWatcherEventMap<S>['doubleClick']) => void | boolean;
  wheelX?: (e: BoardWatcherEventMap<S>['wheelX']) => void | boolean;
  wheelY?: (e: BoardWatcherEventMap<S>['wheelY']) => void | boolean;

  scale?: (e: BoardWatcherEventMap<S>['scale']) => void | boolean;
  scrollX?: (e: BoardWatcherEventMap<S>['scrollX']) => void | boolean;
  scrollY?: (e: BoardWatcherEventMap<S>['scrollY']) => void | boolean;
  resize?: (e: BoardWatcherEventMap<S>['resize']) => void | boolean;

  // draw
  beforeDrawFrame?(e: BoardWatcherEventMap<S>['beforeDrawFrame']): void | boolean;
  afterDrawFrame?(e: BoardWatcherEventMap<S>['afterDrawFrame']): void | boolean;
}

export interface BoardMiddlewareOptions<S extends Record<any | symbol, any>> {
  viewContent: ViewContent;
  sharer: StoreSharer<S>;
  viewer: BoardViewer;
  calculator: ViewCalculator;
}

export type BoardMiddleware<S extends Record<any | symbol, any> = any> = (opts: BoardMiddlewareOptions<S>) => BoardMiddlewareObject<S>;

export interface BoardOptions {
  viewContent: ViewContent;
}

export interface BoardViewerFrameSnapshot<S extends Record<any | symbol, any> = any> {
  activeStore: ActiveStore;
  sharedStore: S;
}

export interface BoardViewerEventMap {
  // eslint-disable-next-line @typescript-eslint/ban-types
  drawFrame: {};
}

export interface BoardViewerOptions {
  sharer: StoreSharer<Record<any | symbol, any>>;
  renderer: BoardRenderer;
  calculator: ViewCalculator;
  viewContent: ViewContent;
  beforeDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot<Record<any | symbol, any>> }) => void;
  afterDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot<Record<any | symbol, any>> }) => void;
}

export interface BoardViewer extends UtilEventEmitter<BoardViewerEventMap> {
  drawFrame(): void;
  scale(num: number): ViewScaleInfo;
  scrollX(num: number): ViewScaleInfo;
  scrollY(num: number): ViewScaleInfo;
  resize(viewSize: Partial<ViewSizeInfo>): ViewSizeInfo;
}

export interface BoardRenderer extends UtilEventEmitter<RendererEventMap> {
  updateOptions(opts: RendererOptions): void;
  drawData(data: Data, opts: RendererDrawOptions): void;
  scale(num: number): void;
}

export interface BoardWatcherOptions {
  viewContent: ViewContent;
  sharer: StoreSharer<Record<any | symbol, any>>;
}

export interface BoardWatcherStore {
  hasPointDown: boolean;
  prevClickPoint: Point | null;
}
