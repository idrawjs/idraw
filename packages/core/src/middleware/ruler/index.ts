import type { BoardMiddleware, CoreEvent } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import { drawRulerBackground, drawXRuler, drawYRuler, calcXRulerScaleList, calcYRulerScaleList, drawUnderGrid } from './util';

export const MiddlewareRuler: BoardMiddleware<Record<string, any>, CoreEvent> = (opts) => {
  const key = 'RULE';
  const { viewContent } = opts;
  const { helperContext, underContext } = viewContent;

  return {
    mode: key,
    isDefault: true,
    beforeDrawFrame: ({ snapshot }) => {
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
  };
};
