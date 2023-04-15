import type { Point } from './point';
import type { ViewContent, ViewCalculator } from './view';
import type { UtilEventEmitter } from './util';
import type { Renderer } from '../renderer';
import type { ActiveStore, StoreSharer } from './store';

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

export type BoardMode = 'SELECT' | 'RULER' | 'CONNECT' | 'PENCIL' | 'PEN';

export interface BoardMiddlewareObject {
  mode: BoardMode;
  created?: () => void;
  hover?: (e: BoardWatcherEventMap['hover']) => void;
  pointStart?: (e: BoardWatcherEventMap['pointStart']) => void;
  pointMove?: (e: BoardWatcherEventMap['pointMove']) => void;
  pointEnd?: (e: BoardWatcherEventMap['pointEnd']) => void;
  pointLeave?: (e: BoardWatcherEventMap['pointLeave']) => void;
  doubleClick?: (e: BoardWatcherEventMap['doubleClick']) => void;
  wheel?: (e: BoardWatcherEventMap['wheel']) => void;
  beforeDrawFrame?(e: BoardWatcherEventMap['beforeDrawFrame']): void;
  afterDrawFrame?(e: BoardWatcherEventMap['afterDrawFrame']): void;
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
  drawFrame: {};
}

export interface BoardViewerOptions {
  sharer: StoreSharer;
  renderer: Renderer;
  viewContent: ViewContent;
  beforeDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
  afterDrawFrame: (e: { snapshot: BoardViewerFrameSnapshot }) => void;
}

export interface BoardViewer extends UtilEventEmitter<BoardViewerEventMap> {
  drawFrame(): void;
}
