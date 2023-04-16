import type { BoardMiddleware, PointWatcherEvent } from '@idraw/types';
import { drawScroller, isPointInScrollbar } from './scroller';

export const MiddlewareScroller: BoardMiddleware = (opts) => {
  const key = 'SCROLL';
  const { viewer, viewContent, sharer } = opts;
  const { helperContext } = viewContent;
  viewer.drawFrame();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const { point } = e;
      const thumbType = isPointInScrollbar(helperContext, point, sharer.getActiveViewSizeInfo());
      if (thumbType === 'X' || thumbType === 'Y') {
        return false;
      }
    },
    pointStart: (e: PointWatcherEvent) => {
      const { point } = e;
      const thumbType = isPointInScrollbar(helperContext, point, sharer.getActiveViewSizeInfo());
      if (thumbType === 'X' || thumbType === 'Y') {
        return false;
      }
    },
    // pointMove: (e: PointWatcherEvent) => {},
    // pointEnd: (e: PointWatcherEvent) => {},
    beforeDrawFrame({ snapshot }) {
      drawScroller(helperContext, { snapshot });
    }
  };
};
