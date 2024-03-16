import type { Point, PointSize } from './point';
import type { BoardContent, ViewCalculator, ViewScaleInfo, ViewSizeInfo } from './view';
import type { UtilEventEmitter } from './util';
import type { ActiveStore, StoreSharer } from './store';
import type { RendererEventMap, RendererOptions, RendererDrawOptions, RendererLoader } from './renderer';
import type { Data } from './data';

export type BoardBaseEventMap = {
  loadSource: void;
};

export type BoardExtendEventMap = BoardBaseEventMap & Record<string, any>;

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
export interface BoardWatherWheelEvent {
  deltaX: number;
  deltaY: number;
  point: Point;
}
export type BoardWatherWheelScaleEvent = BoardWatherWheelXEvent & BoardWatherWheelYEvent;

export interface BoardWatherDrawFrameEvent<S extends Record<any | symbol, any>> {
  snapshot: BoardViewerFrameSnapshot<S>;
}

export type BoardWatherScaleEvent = { scale: number };

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
  wheel: BoardWatherWheelEvent;
  wheelScale: BoardWatherWheelScaleEvent;
  scrollX: BoardWatherScrollXEvent;
  scrollY: BoardWatherScrollYEvent;
  resize: BoardWatherResizeEvent;
  beforeDrawFrame: BoardWatherDrawFrameEvent<S>;
  afterDrawFrame: BoardWatherDrawFrameEvent<S>;
  clear: void;
}

export interface BoardMiddlewareObject<S extends Record<any | symbol, any> = any> {
  name?: string;
  use?: () => void;
  disuse?: () => void;
  // action
  hover?: (e: BoardWatcherEventMap<S>['hover']) => void | boolean;
  pointStart?: (e: BoardWatcherEventMap<S>['pointStart']) => void | boolean;
  pointMove?: (e: BoardWatcherEventMap<S>['pointMove']) => void | boolean;
  pointEnd?: (e: BoardWatcherEventMap<S>['pointEnd']) => void | boolean;
  pointLeave?: (e: BoardWatcherEventMap<S>['pointLeave']) => void | boolean;
  doubleClick?: (e: BoardWatcherEventMap<S>['doubleClick']) => void | boolean;
  // wheelX?: (e: BoardWatcherEventMap<S>['wheelX']) => void | boolean;
  // wheelY?: (e: BoardWatcherEventMap<S>['wheelY']) => void | boolean;
  wheel?: (e: BoardWatcherEventMap<S>['wheel']) => void | boolean;
  wheelScale?: (e: BoardWatcherEventMap<S>['wheelScale']) => void | boolean;

  // scale?: (e: BoardWatcherEventMap<S>['scale']) => void | boolean;
  scrollX?: (e: BoardWatcherEventMap<S>['scrollX']) => void | boolean;
  scrollY?: (e: BoardWatcherEventMap<S>['scrollY']) => void | boolean;
  resize?: (e: BoardWatcherEventMap<S>['resize']) => void | boolean;

  // draw
  beforeDrawFrame?(e: BoardWatcherEventMap<S>['beforeDrawFrame']): void | boolean;
  afterDrawFrame?(e: BoardWatcherEventMap<S>['afterDrawFrame']): void | boolean;

  clear?(e: BoardWatcherEventMap<S>['clear']): void | boolean;
}

export interface BoardMiddlewareOptions<S extends Record<any | symbol, any> = Record<any | symbol, any>, E extends BoardExtendEventMap = BoardExtendEventMap> {
  boardContent: BoardContent;
  sharer: StoreSharer<S>;
  viewer: BoardViewer;
  calculator: ViewCalculator;
  eventHub: UtilEventEmitter<E>;
  container?: HTMLDivElement;
  canvas?: HTMLCanvasElement;
}

export type BoardMiddleware<S extends Record<any | symbol, any> = any, E extends BoardExtendEventMap = BoardExtendEventMap> = (
  opts: BoardMiddlewareOptions<S, E>
) => BoardMiddlewareObject<S>;

export interface BoardOptions {
  boardContent: BoardContent;
  container?: HTMLDivElement;
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
  boardContent: BoardContent;
  beforeDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot<Record<any | symbol, any>> }) => void;
  afterDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot<Record<any | symbol, any>> }) => void;
}

// export interface BoardViewerStorage {
//   viewVisibleInfoMap: ViewVisibleInfoMap;
// }

export interface BoardViewer extends UtilEventEmitter<BoardViewerEventMap> {
  drawFrame(): void;
  scale(opts: { scale: number; point: PointSize; ignoreUpdateVisibleStatus?: boolean }): { moveX: number; moveY: number };
  scroll(opts: { moveX?: number; moveY?: number; ignoreUpdateVisibleStatus?: boolean }): ViewScaleInfo;
  resize(viewSize: Partial<ViewSizeInfo>, opts?: { ignoreUpdateVisibleStatus?: boolean }): ViewSizeInfo;
  updateViewScaleInfo(opts: { scale: number; offsetX: number; offsetY: number }): ViewScaleInfo;

  // resetViewVisibleInfoMap(
  //   data: Data,
  //   opts: {
  //     viewScaleInfo: ViewScaleInfo;
  //     viewSizeInfo: ViewSizeInfo;
  //   }
  // ): void;
  // modifyViewVisibleInfoMap(
  //   data: Data,
  //   opts: {
  //     modifyOptions: ModifyOptions;
  //     viewScaleInfo: ViewScaleInfo;
  //     viewSizeInfo: ViewSizeInfo;
  //   }
  // ): void;
}

export interface BoardRenderer extends UtilEventEmitter<RendererEventMap> {
  updateOptions(opts: RendererOptions): void;
  drawData(data: Data, opts: RendererDrawOptions): void;
  scale(num: number): void;
  destroy(): void;
  isDestroyed(): boolean;
  getLoader(): RendererLoader;
}

export interface BoardWatcherOptions {
  boardContent: BoardContent;
  sharer: StoreSharer<Record<any | symbol, any>>;
}

export interface BoardWatcherStore {
  hasPointDown: boolean;
  prevClickPoint: Point | null;
}
