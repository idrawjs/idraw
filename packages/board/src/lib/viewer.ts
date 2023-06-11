import { EventEmitter, viewScale, viewScroll } from '@idraw/util';
import type { BoardViewer, BoardViewerEventMap, BoardViewerOptions, ActiveStore, BoardViewerFrameSnapshot, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';

const { requestAnimationFrame } = window;

type ViewerDrawFrameStatus = 'DRAWING' | 'FREE' | 'COMPLETE';

export class Viewer extends EventEmitter<BoardViewerEventMap> implements BoardViewer {
  private _opts: BoardViewerOptions;
  private _drawFrameSnapshotQueue: BoardViewerFrameSnapshot[] = [];
  private _drawFrameStatus: ViewerDrawFrameStatus = 'FREE';

  constructor(opts: BoardViewerOptions) {
    super();
    this._opts = opts;
    this._init();
  }

  private _init() {
    const { renderer } = this._opts;
    renderer.on('load', () => {
      this.drawFrame();
    });
  }

  private _drawAnimationFrame() {
    if (this._drawFrameStatus === 'DRAWING' || this._drawFrameSnapshotQueue.length === 0) {
      return;
    } else {
      this._drawFrameStatus = 'DRAWING';
    }
    const snapshot = this._drawFrameSnapshotQueue.shift();

    const { renderer, viewContent, beforeDrawFrame, afterDrawFrame } = this._opts;

    if (snapshot) {
      const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight, width, height, contextX, contextY, contextHeight, contextWidth, devicePixelRatio } =
        snapshot.activeStore;
      const { viewContext, helperContext, boardContext } = viewContent;

      if (snapshot?.activeStore.data) {
        renderer.drawData(snapshot.activeStore.data, {
          viewScaleInfo: {
            scale,
            offsetTop,
            offsetBottom,
            offsetLeft,
            offsetRight
          },
          viewSizeInfo: {
            width,
            height,
            contextX,
            contextY,
            contextHeight,
            contextWidth,
            devicePixelRatio
          }
        });
      }
      beforeDrawFrame({ snapshot });
      boardContext.clearRect(0, 0, width, height);
      boardContext.drawImage(viewContext.canvas, 0, 0, width, height);
      boardContext.drawImage(helperContext.canvas, 0, 0, width, height);
      viewContext.clearRect(0, 0, width, height);
      helperContext.clearRect(0, 0, width, height);
      afterDrawFrame({ snapshot });
    }

    if (this._drawFrameSnapshotQueue.length === 0) {
      this._drawFrameStatus = 'COMPLETE';
      return;
    }
    if ((this._drawFrameStatus = 'DRAWING')) {
      requestAnimationFrame(() => {
        this._drawAnimationFrame();
      });
    }
  }

  drawFrame(): void {
    const { sharer } = this._opts;
    const activeStore: ActiveStore = sharer.getActiveStoreSnapshot();
    const sharedStore: Record<string, any> = sharer.getSharedStoreSnapshot();
    this._drawFrameSnapshotQueue.push({
      activeStore,
      sharedStore
    });
    this._drawAnimationFrame();
  }

  scale(num: number): ViewScaleInfo {
    const { sharer, renderer } = this._opts;
    const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = viewScale({ num, prevViewScaleInfo, viewSizeInfo });
    sharer.setActiveScaleInfo(viewScaleInfo);
    renderer.scale(num);
    return viewScaleInfo;
  }

  scrollX(num: number): ViewScaleInfo {
    const { sharer } = this._opts;
    const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = viewScroll({ moveX: num - (prevViewScaleInfo.offsetLeft || 0), viewScaleInfo: prevViewScaleInfo, viewSizeInfo });
    sharer.setActiveScaleInfo(viewScaleInfo);
    return viewScaleInfo;
  }

  scrollY(num: number): ViewScaleInfo {
    const { sharer } = this._opts;
    const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = viewScroll({ moveY: num - (prevViewScaleInfo.offsetTop || 0), viewScaleInfo: prevViewScaleInfo, viewSizeInfo });
    sharer.setActiveScaleInfo(viewScaleInfo);
    return viewScaleInfo;
  }

  resize(viewSize: Partial<ViewSizeInfo> = {}): ViewSizeInfo {
    const { sharer } = this._opts;
    const originViewSize = sharer.getActiveViewSizeInfo();
    const newViewSize = { ...originViewSize, ...viewSize };

    const { width, height, devicePixelRatio } = newViewSize;
    const { boardContext, helperContext, viewContext } = this._opts.viewContent;
    boardContext.canvas.width = width * devicePixelRatio;
    boardContext.canvas.height = height * devicePixelRatio;
    boardContext.canvas.style.width = `${width}px`;
    boardContext.canvas.style.height = `${height}px`;

    helperContext.canvas.width = width * devicePixelRatio;
    helperContext.canvas.height = height * devicePixelRatio;

    viewContext.canvas.width = width * devicePixelRatio;
    viewContext.canvas.height = height * devicePixelRatio;

    sharer.setActiveViewSizeInfo(newViewSize);
    return newViewSize;
  }
}
