import type { Point, BoardMiddleware, PointWatcherEvent, BoardWatherWheelXEvent, BoardWatherWheelYEvent } from '@idraw/types';
import { drawScroller, isPointInScrollbar, calcScrollerInfo } from './scroller';
import type { ScrollbarThumbType } from './scroller';

export const MiddlewareScroller: BoardMiddleware = (opts) => {
  const key = 'SCROLL';
  const { viewer, viewContent, sharer } = opts;
  const { helperContext } = viewContent;
  viewer.drawFrame();

  let activeThumbType: ScrollbarThumbType | null = null;

  const scrollX = (p: Point) => {
    const scrollerInfo = calcScrollerInfo(sharer.getActiveScaleInfo(), sharer.getActiveViewSizeInfo());
    const offsetLeft = sharer.getActiveStorage('offsetLeft');
    const moveX = p.x - (scrollerInfo.translateX + scrollerInfo.xSize / 2);
    viewer.scrollX(offsetLeft - moveX);
    viewer.drawFrame();
  };

  const scrollY = (p: Point) => {
    const scrollerInfo = calcScrollerInfo(sharer.getActiveScaleInfo(), sharer.getActiveViewSizeInfo());
    const offsetTop = sharer.getActiveStorage('offsetTop');
    const moveY = p.y - (scrollerInfo.translateY + scrollerInfo.ySize / 2);
    viewer.scrollY(offsetTop - moveY);
    viewer.drawFrame();
  };

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
        if (thumbType === 'X') {
          scrollX(point);
        } else if (thumbType === 'Y') {
          scrollY(point);
        }
        return false;
      }
    },
    pointMove: (e: PointWatcherEvent) => {
      const { point } = e;
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        if (activeThumbType === 'X') {
          scrollX(point);
        } else if (activeThumbType === 'Y') {
          scrollY(point);
        }
        return false;
      }
    },
    pointEnd: (e: PointWatcherEvent) => {
      const { point } = e;
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        if (activeThumbType === 'X') {
          scrollX(point);
        } else if (activeThumbType === 'Y') {
          scrollY(point);
        }
        activeThumbType = null;
        return false;
      }
    },
    beforeDrawFrame({ snapshot }) {
      drawScroller(helperContext, { snapshot });
    }
  };
};
