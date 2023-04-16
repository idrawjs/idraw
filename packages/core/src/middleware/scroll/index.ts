import type { BoardMiddleware, PointWatcherEvent, BoardWatherWheelXEvent, BoardWatherWheelYEvent } from '@idraw/types';
import { drawScroller, isPointInScrollbar, calcScrollerInfo } from './scroller';
import type { ScrollbarThumbType } from './scroller';

export const MiddlewareScroller: BoardMiddleware = (opts) => {
  const key = 'SCROLL';
  const { viewer, viewContent, sharer } = opts;
  const { helperContext } = viewContent;
  viewer.drawFrame();

  let activeThumbType: ScrollbarThumbType | null = null;

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const { point } = e;
      const thumbType = isPointInScrollbar(helperContext, point, sharer.getActiveViewSizeInfo());
      if (thumbType === 'X' || thumbType === 'Y') {
        return false;
      }
    },
    wheelX: (e: BoardWatherWheelXEvent) => {
      const offsetLeft = sharer.getActiveStorage('offsetLeft');
      if ((e.deltaX >= 0 || e.deltaX < 0) && offsetLeft <= 0) {
        viewer.scrollX(offsetLeft - e.deltaX);
        viewer.drawFrame();
      }
    },
    wheelY: (e: BoardWatherWheelYEvent) => {
      const offsetTop = sharer.getActiveStorage('offsetTop');
      if ((e.deltaY >= 0 || e.deltaY < 0) && offsetTop <= 0) {
        viewer.scrollY(offsetTop - e.deltaY);
        viewer.drawFrame();
      }
    },
    pointStart: (e: PointWatcherEvent) => {
      const { point } = e;
      const thumbType = isPointInScrollbar(helperContext, point, sharer.getActiveViewSizeInfo());
      if (thumbType === 'X' || thumbType === 'Y') {
        activeThumbType = thumbType;
        // TODO
        return false;
      }
    },
    pointMove: (e: PointWatcherEvent) => {
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        const scrollerInfo = calcScrollerInfo(sharer.getActiveScaleInfo(), sharer.getActiveViewSizeInfo());
        const { xSize, ySize } = scrollerInfo;
        if (activeThumbType === 'X') {
          // TODO
        } else if (activeThumbType === 'Y') {
          // TODO
        }
        return false;
      }
    },
    pointEnd: (e: PointWatcherEvent) => {
      if (!activeThumbType) {
        activeThumbType = null;
      }
    },
    beforeDrawFrame({ snapshot }) {
      drawScroller(helperContext, { snapshot });
    }
  };
};
