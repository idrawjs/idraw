import type { BoardMiddleware, CoreEvent } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import { drawRulerBackground, drawXRuler, drawYRuler, calcXRulerScaleList, calcYRulerScaleList, drawUnderGrid } from './util';

export const middlewareEventRuler = '@middleware/show-ruler';

export const MiddlewareRuler: BoardMiddleware<Record<string, any>, CoreEvent> = (opts) => {
  const key = 'RULE';
  const { viewContent, viewer, eventHub } = opts;
  const { helperContext, underContext } = viewContent;
  let showRuler: boolean = true;

  eventHub.on(middlewareEventRuler, (e: { show: boolean }) => {
    if (typeof e?.show === 'boolean') {
      showRuler = e.show;
      viewer.drawFrame();
    }
  });
  return {
    mode: key,
    isDefault: true,
    beforeDrawFrame: ({ snapshot }) => {
      if (showRuler === true) {
        const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
        const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);
        drawRulerBackground(helperContext, { viewScaleInfo, viewSizeInfo });

        const xList = calcXRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawXRuler(helperContext, { scaleList: xList });

        const yList = calcYRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawYRuler(helperContext, { scaleList: yList });

        drawUnderGrid(underContext, {
          xList,
          yList,
          viewScaleInfo,
          viewSizeInfo
        });
      }
    }
  };
};
