import { EventEmitter, viewScale, viewScroll } from '@idraw/util';
import type {
  PointSize,
  BoardViewer,
  BoardViewerEventMap,
  BoardViewerOptions,
  ActiveStore,
  BoardViewerFrameSnapshot,
  ViewScaleInfo,
  ViewSizeInfo
} from '@idraw/types';

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
      const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight, width, height, contextHeight, contextWidth, devicePixelRatio } = snapshot.activeStore;
      const { underContext, viewContext, helperContext, boardContext } = viewContent;

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
            contextHeight,
            contextWidth,
            devicePixelRatio
          }
        });
      }
      beforeDrawFrame({ snapshot });
      boardContext.clearRect(0, 0, width, height);
      boardContext.drawImage(underContext.canvas, 0, 0, width, height);
      boardContext.drawImage(viewContext.canvas, 0, 0, width, height);
      boardContext.drawImage(helperContext.canvas, 0, 0, width, height);
      underContext.clearRect(0, 0, width, height);
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

  scale(opts: { scale: number; point: PointSize }): { moveX: number; moveY: number } {
    const { scale, point } = opts;
    const { sharer } = this._opts;
    const { moveX, moveY } = viewScale({
      scale,
      point,
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo()
    });
    sharer.setActiveStorage('scale', scale);
    // renderer.scale(scale);
    return { moveX, moveY };
  }

  scroll(opts: { moveX: number; moveY: number }): ViewScaleInfo {
    const { sharer } = this._opts;
    const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo();
    const { moveX, moveY } = opts;
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = viewScroll({
      moveX,
      moveY,
      viewScaleInfo: prevViewScaleInfo,
      viewSizeInfo
    });
    sharer.setActiveViewScaleInfo(viewScaleInfo);
    return viewScaleInfo;
  }

  // scrollX(num: number): ViewScaleInfo {
  //   // TODO
  //   const { sharer } = this._opts;
  //   return sharer.getActiveViewScaleInfo();
  //   // const { sharer } = this._opts;
  //   // const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo();
  //   // const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
  //   // const viewScaleInfo = viewScroll({ moveX: num - (prevViewScaleInfo.offsetLeft || 0), viewScaleInfo: prevViewScaleInfo, viewSizeInfo });
  //   // sharer.setActiveViewScaleInfo(viewScaleInfo);
  //   // return viewScaleInfo;
  // }

  // scrollY(num: number): ViewScaleInfo {
  //   // TODO
  //   const { sharer } = this._opts;
  //   return sharer.getActiveViewScaleInfo();
  //   // const { sharer } = this._opts;
  //   // const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo();
  //   // const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
  //   // const viewScaleInfo = viewScroll({ moveY: num - (prevViewScaleInfo.offsetTop || 0), viewScaleInfo: prevViewScaleInfo, viewSizeInfo });
  //   // sharer.setActiveViewScaleInfo(viewScaleInfo);
  //   // return viewScaleInfo;
  // }

  resize(viewSize: Partial<ViewSizeInfo> = {}): ViewSizeInfo {
    const { sharer } = this._opts;
    const originViewSize = sharer.getActiveViewSizeInfo();
    const newViewSize = { ...originViewSize, ...viewSize };

    const { width, height, devicePixelRatio } = newViewSize;
    const { underContext, boardContext, helperContext, viewContext } = this._opts.viewContent;
    boardContext.canvas.width = width * devicePixelRatio;
    boardContext.canvas.height = height * devicePixelRatio;
    boardContext.canvas.style.width = `${width}px`;
    boardContext.canvas.style.height = `${height}px`;

    underContext.canvas.width = width * devicePixelRatio;
    underContext.canvas.height = height * devicePixelRatio;

    helperContext.canvas.width = width * devicePixelRatio;
    helperContext.canvas.height = height * devicePixelRatio;

    viewContext.canvas.width = width * devicePixelRatio;
    viewContext.canvas.height = height * devicePixelRatio;

    sharer.setActiveViewSizeInfo(newViewSize);
    return newViewSize;
  }
}
