import { EventEmitter, viewScale, viewScroll, calcViewScaleInfo } from '@idraw/util';
import type {
  PointSize,
  BoardViewer,
  BoardViewerEventMap,
  BoardViewerOptions,
  // BoardViewerStorage,
  ActiveStore,
  BoardViewerFrameSnapshot,
  ViewScaleInfo,
  ViewSizeInfo,
  Data
} from '@idraw/types';

const { requestAnimationFrame } = window;

type ViewerDrawFrameStatus = 'DRAWING' | 'FREE' | 'COMPLETE';

export class Viewer extends EventEmitter<BoardViewerEventMap> implements BoardViewer {
  #opts: BoardViewerOptions;
  #drawFrameSnapshotQueue: BoardViewerFrameSnapshot[] = [];
  #drawFrameStatus: ViewerDrawFrameStatus = 'FREE';

  constructor(opts: BoardViewerOptions) {
    super();
    this.#opts = opts;
    this.#init();
  }

  #init() {
    const { renderer } = this.#opts;
    renderer.on('load', () => {
      this.drawFrame();
    });
  }

  #drawAnimationFrame() {
    if (this.#drawFrameStatus === 'DRAWING' || this.#drawFrameSnapshotQueue.length === 0) {
      return;
    } else {
      this.#drawFrameStatus = 'DRAWING';
    }
    const snapshot = this.#drawFrameSnapshotQueue.shift();

    const { renderer, boardContent, beforeDrawFrame, afterDrawFrame } = this.#opts;

    if (snapshot) {
      const { scale, offsetTop, offsetBottom, offsetLeft, offsetRight, width, height, contextHeight, contextWidth, devicePixelRatio } = snapshot.activeStore;

      const viewScaleInfo: ViewScaleInfo = {
        scale,
        offsetTop,
        offsetBottom,
        offsetLeft,
        offsetRight
      };
      const viewSizeInfo: ViewSizeInfo = {
        width,
        height,
        contextHeight,
        contextWidth,
        devicePixelRatio
      };
      if (snapshot?.activeStore.data) {
        renderer.drawData(snapshot.activeStore.data, {
          viewScaleInfo,
          viewSizeInfo
        });
      }

      beforeDrawFrame({ snapshot });

      boardContent.drawView();

      afterDrawFrame({ snapshot });
    }

    if (this.#drawFrameSnapshotQueue.length === 0) {
      this.#drawFrameStatus = 'COMPLETE';
      return;
    }
    if ((this.#drawFrameStatus = 'DRAWING')) {
      requestAnimationFrame(() => {
        this.#drawAnimationFrame();
      });
    }
  }

  resetViewVisibleInfoMap(
    data: Data,
    opts: {
      viewScaleInfo: ViewScaleInfo;
      viewSizeInfo: ViewSizeInfo;
    }
  ): void {
    if (data) {
      this.#opts.calculator.resetViewVisibleInfoMap(data, opts);
    }
  }

  drawFrame(): void {
    const { sharer } = this.#opts;
    const activeStore: ActiveStore = sharer.getActiveStoreSnapshot();
    const sharedStore: Record<string, any> = sharer.getSharedStoreSnapshot();
    this.#drawFrameSnapshotQueue.push({
      activeStore,
      sharedStore
    });
    this.#drawAnimationFrame();
  }

  scale(opts: { scale: number; point: PointSize; ignoreUpdateVisibleStatus?: boolean }): { moveX: number; moveY: number } {
    const { scale, point, ignoreUpdateVisibleStatus } = opts;
    const { sharer } = this.#opts;
    const { moveX, moveY } = viewScale({
      scale,
      point,
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo()
    });
    sharer.setActiveStorage('scale', scale);
    if (!ignoreUpdateVisibleStatus) {
      this.#opts.calculator.updateVisiableStatus({
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo()
      });
    }
    return { moveX, moveY };
  }

  scroll(opts: { moveX: number; moveY: number; ignoreUpdateVisibleStatus?: boolean }): ViewScaleInfo {
    const { sharer } = this.#opts;
    const prevViewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo();
    const { moveX, moveY, ignoreUpdateVisibleStatus } = opts;
    const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo();
    const viewScaleInfo = viewScroll({
      moveX,
      moveY,
      viewScaleInfo: prevViewScaleInfo,
      viewSizeInfo
    });
    sharer.setActiveViewScaleInfo(viewScaleInfo);
    if (!ignoreUpdateVisibleStatus) {
      this.#opts.calculator.updateVisiableStatus({
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo()
      });
    }
    return viewScaleInfo;
  }

  updateViewScaleInfo(opts: { scale: number; offsetX: number; offsetY: number }): ViewScaleInfo {
    const { sharer } = this.#opts;
    const viewScaleInfo = calcViewScaleInfo(opts, {
      viewSizeInfo: sharer.getActiveViewSizeInfo()
    });

    sharer.setActiveViewScaleInfo(viewScaleInfo);

    this.#opts.calculator.updateVisiableStatus({
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo()
    });
    return viewScaleInfo;
  }

  resize(viewSize: Partial<ViewSizeInfo> = {}, opts?: { ignoreUpdateVisibleStatus?: boolean }): ViewSizeInfo {
    const { sharer } = this.#opts;
    const originViewSize = sharer.getActiveViewSizeInfo();
    const newViewSize = { ...originViewSize, ...viewSize };

    const { width, height, devicePixelRatio } = newViewSize;
    const { underContext, boardContext, helperContext, viewContext } = this.#opts.boardContent;
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
    if (!opts?.ignoreUpdateVisibleStatus) {
      this.#opts.calculator.updateVisiableStatus({
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo()
      });
    }
    return newViewSize;
  }
}
