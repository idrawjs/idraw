import { EventEmitter } from '@idraw/util';
import type { BoardViewer, BoardViewerEventMap, BoardViewerOptions, ActiveStore, BoardViewerFrameSnapshot } from '@idraw/types';

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
        renderer.drawData(snapshot.activeStore.data, {
          scale: snapshot?.activeStore.scale,
          offsetTop: snapshot?.activeStore.offsetTop,
          offsetBottom: snapshot?.activeStore.offsetBottom,
          offsetLeft: snapshot?.activeStore.offsetLeft,
          offsetRight: snapshot?.activeStore.offsetRight
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
}
