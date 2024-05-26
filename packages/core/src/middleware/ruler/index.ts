import type { BoardMiddleware, CoreEventMap } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import { drawRulerBackground, drawXRuler, drawYRuler, calcXRulerScaleList, calcYRulerScaleList, drawGrid, drawScrollerSelectedArea } from './util';
import type { DeepRulerSharedStorage } from './types';

export const middlewareEventRuler = '@middleware/show-ruler';

export const MiddlewareRuler: BoardMiddleware<DeepRulerSharedStorage, CoreEventMap> = (opts) => {
  const { boardContent, viewer, eventHub, calculator } = opts;
  const { overlayContext, underlayContext } = boardContent;
  let show: boolean = true;
  let showGrid: boolean = true;

  const rulerCallback = (e: { show: boolean; showGrid: boolean }) => {
    if (typeof e?.show === 'boolean') {
      show = e.show;
    }
    if (typeof e?.showGrid === 'boolean') {
      showGrid = e.showGrid;
    }

    if (typeof e?.show === 'boolean' || typeof e?.showGrid === 'boolean') {
      viewer.drawFrame();
    }
  };

  return {
    name: '@middleware/ruler',
    use() {
      eventHub.on(middlewareEventRuler, rulerCallback);
    },
    disuse() {
      eventHub.off(middlewareEventRuler, rulerCallback);
    },
    beforeDrawFrame: ({ snapshot }) => {
      if (show === true) {
        const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
        const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);

        drawScrollerSelectedArea(overlayContext, { snapshot, calculator });

        drawRulerBackground(overlayContext, { viewScaleInfo, viewSizeInfo });

        const { list: xList, rulerUnit } = calcXRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawXRuler(overlayContext, { scaleList: xList });

        const { list: yList } = calcYRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawYRuler(overlayContext, { scaleList: yList });

        if (showGrid === true) {
          const ctx = rulerUnit === 1 ? overlayContext : underlayContext;
          drawGrid(ctx, {
            xList,
            yList,
            viewScaleInfo,
            viewSizeInfo
          });
        }
      }
    }
  };
};
