import type { Middleware, CoreEventMap, MiddlewareRulerConfig } from '@idraw/types';
import { getViewScaleInfoFromSnapshot, getViewSizeInfoFromSnapshot } from '@idraw/util';
import {
  drawRulerBackground,
  drawXRuler,
  drawYRuler,
  calcXRulerScaleList,
  calcYRulerScaleList,
  drawGrid,
  drawScrollerSelectedArea,
} from './util';
import type { DeepRulerSharedStorage } from './types';
import { defaultStyle, getMiddlewareRulerStyles } from './static';
import { coreEventKeys } from '../../static';

export { getMiddlewareRulerStyles };

export const MiddlewareRuler: Middleware<DeepRulerSharedStorage, CoreEventMap, MiddlewareRulerConfig> = (
  opts,
  config
) => {
  const { boardContent, viewer, eventHub, calculator } = opts;
  const { overlayContext, underlayContext } = boardContent;
  let innerConfig = {
    ...defaultStyle,
    ...config,
  };

  let styles = getMiddlewareRulerStyles(innerConfig);

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
      eventHub.on(coreEventKeys.RULER, rulerCallback);
    },

    disuse() {
      eventHub.off(coreEventKeys.RULER, rulerCallback);
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
      styles = getMiddlewareRulerStyles(innerConfig);
    },

    beforeDrawFrame: ({ snapshot }) => {
      if (show === true) {
        const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
        const viewSizeInfo = getViewSizeInfoFromSnapshot(snapshot);

        drawRulerBackground(overlayContext, { viewScaleInfo, viewSizeInfo, styles });

        drawScrollerSelectedArea(overlayContext, { snapshot, calculator, styles });

        const { list: xList, rulerUnit } = calcXRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawXRuler(overlayContext, { scaleList: xList, styles });

        const { list: yList } = calcYRulerScaleList({ viewScaleInfo, viewSizeInfo });
        drawYRuler(overlayContext, { scaleList: yList, styles });

        if (showGrid === true) {
          const ctx = rulerUnit === 1 ? overlayContext : underlayContext;
          drawGrid(ctx, {
            xList,
            yList,
            viewScaleInfo,
            viewSizeInfo,
            styles,
          });
        }
      }
    },
  };
};
