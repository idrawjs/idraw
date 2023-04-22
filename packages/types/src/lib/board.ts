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
}
export interface BoardWatherWheelYEvent {
  deltaY: number;
}

export interface BoardWatherDrawFrameEvent {
  snapshot: BoardViewerFrameSnapshot;
}

export type BoardWatherScaleEvent = ViewScaleInfo;

export type BoardWatherScrollXEvent = ViewScaleInfo;

export type BoardWatherScrollYEvent = ViewScaleInfo;

export type BoardWatherResizeEvent = ViewSizeInfo;

export interface BoardWatcherEventMap {
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
  beforeDrawFrame: BoardWatherDrawFrameEvent;
  afterDrawFrame: BoardWatherDrawFrameEvent;
}

export type BoardMode = 'SELECT' | 'SCROLL' | 'RULE' | 'CONNECT' | 'PENCIL' | 'PEN' | string;

export interface BoardMiddlewareObject {
  mode: BoardMode;
  isDefault?: boolean;
  created?: () => void;
  // action
  hover?: (e: BoardWatcherEventMap['hover']) => void | boolean;
  pointStart?: (e: BoardWatcherEventMap['pointStart']) => void | boolean;
  pointMove?: (e: BoardWatcherEventMap['pointMove']) => void | boolean;
  pointEnd?: (e: BoardWatcherEventMap['pointEnd']) => void | boolean;
  pointLeave?: (e: BoardWatcherEventMap['pointLeave']) => void | boolean;
  doubleClick?: (e: BoardWatcherEventMap['doubleClick']) => void | boolean;
  wheelX?: (e: BoardWatcherEventMap['wheelX']) => void | boolean;
  wheelY?: (e: BoardWatcherEventMap['wheelY']) => void | boolean;

  scale?: (e: BoardWatcherEventMap['scale']) => void | boolean;
  scrollX?: (e: BoardWatcherEventMap['scrollX']) => void | boolean;
  scrollY?: (e: BoardWatcherEventMap['scrollY']) => void | boolean;
  resize?: (e: BoardWatcherEventMap['resize']) => void | boolean;

  // draw
  beforeDrawFrame?(e: BoardWatcherEventMap['beforeDrawFrame']): void | boolean;
  afterDrawFrame?(e: BoardWatcherEventMap['afterDrawFrame']): void | boolean;
}

export interface BoardMiddlewareOptions {
  viewContent: ViewContent;
  sharer: StoreSharer;
  viewer: BoardViewer;
  calculator: ViewCalculator;
}

export type BoardMiddleware = (opts: BoardMiddlewareOptions) => BoardMiddlewareObject;

export interface BoardOptions {
  viewContent: ViewContent;
}

export interface BoardViewerFrameSnapshot {
  activeStore: ActiveStore;
  sharedStore: Record<string, any>;
}

export interface BoardViewerEventMap {
  // eslint-disable-next-line @typescript-eslint/ban-types
  drawFrame: {};
}

export interface BoardViewerOptions {
  sharer: StoreSharer;
  renderer: BoardRenderer;
  calculator: ViewCalculator;
  viewContent: ViewContent;
  beforeDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
  afterDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
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
