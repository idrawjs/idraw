import type { Point } from './point';
import type { ViewContent, ViewCalculator } from './view';
import type { UtilEventEmitter } from './util';
import type { ActiveStore, StoreSharer } from './store';
import type { RendererEventMap, RendererOptions, RendererDrawOptions } from './renderer';
import type { Data } from './data';

interface BoardWatcherPointEvent {
  point: Point;
}

interface BoardWatherWheelEvent {
  deltaX: number;
  deltaY: number;
}

interface BoardWatherDrawFrameEvent {
  snapshot: BoardViewerFrameSnapshot;
}

export interface BoardWatcherEventMap {
  hover: BoardWatcherPointEvent;
  pointStart: BoardWatcherPointEvent;
  pointMove: BoardWatcherPointEvent;
  pointEnd: BoardWatcherPointEvent;
  pointLeave: BoardWatcherPointEvent;
  doubleClick: BoardWatcherPointEvent;
  wheel: BoardWatherWheelEvent;
  beforeDrawFrame: BoardWatherDrawFrameEvent;
  afterDrawFrame: BoardWatherDrawFrameEvent;
}

export type BoardMode = 'SELECT' | 'SCROLL' | 'RULER' | 'CONNECT' | 'PENCIL' | 'PEN' | string;

export interface BoardMiddlewareObject {
  mode: BoardMode;
  isDefault?: boolean;
  created?: () => void;
  hover?: (e: BoardWatcherEventMap['hover']) => void | boolean;
  pointStart?: (e: BoardWatcherEventMap['pointStart']) => void | boolean;
  pointMove?: (e: BoardWatcherEventMap['pointMove']) => void | boolean;
  pointEnd?: (e: BoardWatcherEventMap['pointEnd']) => void | boolean;
  pointLeave?: (e: BoardWatcherEventMap['pointLeave']) => void | boolean;
  doubleClick?: (e: BoardWatcherEventMap['doubleClick']) => void | boolean;
  wheel?: (e: BoardWatcherEventMap['wheel']) => void | boolean;
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
  viewContent: ViewContent;
  beforeDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
  afterDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
}

export interface BoardViewer extends UtilEventEmitter<BoardViewerEventMap> {
  drawFrame(): void;
}

export interface BoardRenderer extends UtilEventEmitter<RendererEventMap> {
  updateOptions(opts: RendererOptions): void;
  drawData(data: Data, opts: RendererDrawOptions): void;
  scale(num: number): void;
}
