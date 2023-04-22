import { EventEmitter } from '@idraw/util';
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
      const { viewContext, helperContext, boardContext } = viewContent;

      if (snapshot?.activeStore.data) {
        const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight, width, height, contextHeight, contextWidth, devicePixelRatio } = snapshot.activeStore;
        renderer.drawData(snapshot.activeStore.data, {
          scaleInfo: {
            scale,
            offsetTop,
            offsetBottom,
            offsetLeft,
            offsetRight
          },
          viewSize: {
            width,
            height,
            contextHeight,
            contextWidth,
            devicePixelRatio
          }
        });
      }
      beforeDrawFrame({ snapshot });
      const { width, height } = boardContext.canvas;
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

  scale(num: number) {
    const { sharer, renderer, calculator } = this._opts;
    const prevScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const scaleInfo = calculator.viewScale(num, prevScaleInfo, viewSizeInfo);
    sharer.setActiveScaleInfo(scaleInfo);
    renderer.scale(num);
  }

  scrollX(num: number) {
    const { sharer, calculator } = this._opts;
    const prevScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const scaleInfo = calculator.viewScroll({ moveX: num - (prevScaleInfo.offsetLeft || 0) }, prevScaleInfo, viewSizeInfo);
    sharer.setActiveScaleInfo(scaleInfo);
  }

  scrollY(num: number) {
    const { sharer, calculator } = this._opts;
    const prevScaleInfo: ViewScaleInfo = sharer.getActiveScaleInfo();
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const scaleInfo = calculator.viewScroll({ moveY: num - (prevScaleInfo.offsetTop || 0) }, prevScaleInfo, viewSizeInfo);
    sharer.setActiveScaleInfo(scaleInfo);
  }
}
