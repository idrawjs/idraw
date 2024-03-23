import type { Point, BoardMiddleware, PointWatcherEvent, BoardWatherWheelEvent } from '@idraw/types';
import { drawScroller, isPointInScrollThumb } from './util';
// import type { ScrollbarThumbType } from './util';
import { keyXThumbRect, keyYThumbRect, keyPrevPoint, keyActivePoint, keyActiveThumbType } from './config';
import type { DeepScrollerSharedStorage } from './types';

export const MiddlewareScroller: BoardMiddleware<DeepScrollerSharedStorage> = (opts) => {
  const { viewer, boardContent, sharer } = opts;
  const { helperContext } = boardContent;
  sharer.setSharedStorage(keyXThumbRect, null); // null | ElementSize
  sharer.setSharedStorage(keyYThumbRect, null); // null | ElementSize

  // viewer.drawFrame();
  const clear = () => {
    sharer.setSharedStorage(keyPrevPoint, null); // null | Point;
    sharer.setSharedStorage(keyActivePoint, null); // null | Point;
    sharer.setSharedStorage(keyActiveThumbType, null); // null | 'X' | 'Y'
  };

  clear();

  // let activeThumbType: ScrollbarThumbType | null = null;

  const scrollX = (p: Point) => {
    const prevPoint: null | Point = sharer.getSharedStorage(keyPrevPoint);
    if (prevPoint) {
      const { offsetLeft, offsetRight } = sharer.getActiveViewScaleInfo();
      const { width } = sharer.getActiveViewSizeInfo();
      const thumbMoveX = -(p.x - prevPoint.x);
      const totalWidth = width + Math.abs(offsetLeft) + Math.abs(offsetRight);
      const moveX = (thumbMoveX * totalWidth) / width;
      viewer.scroll({ moveX });
      viewer.drawFrame();
    }
  };

  const scrollY = (p: Point) => {
    const prevPoint: null | Point = sharer.getSharedStorage(keyPrevPoint);
    if (prevPoint) {
      const { offsetTop, offsetBottom } = sharer.getActiveViewScaleInfo();
      const { height } = sharer.getActiveViewSizeInfo();
      const thumbMoveY = -(p.y - prevPoint.y);
      const totalHeight = height + Math.abs(offsetTop) + Math.abs(offsetBottom);
      const moveY = (thumbMoveY * totalHeight) / height;
      viewer.scroll({ moveY });
      viewer.drawFrame();
    }
  };

  const getThumbType = (p: Point) => {
    return isPointInScrollThumb(helperContext, p, {
      xThumbRect: sharer.getSharedStorage(keyXThumbRect),
      yThumbRect: sharer.getSharedStorage(keyYThumbRect)
    });
  };

  return {
    name: '@middleware/scroller',
    wheel: (e: BoardWatherWheelEvent) => {
      viewer.scroll({
        moveX: 0 - e.deltaX,
        moveY: 0 - e.deltaY
      });
      viewer.drawFrame();
    },

    pointStart: (e: PointWatcherEvent) => {
      const { point } = e;
      const thumbType = getThumbType(point);
      if (thumbType === 'X' || thumbType === 'Y') {
        sharer.setSharedStorage(keyActiveThumbType, thumbType);
        sharer.setSharedStorage(keyPrevPoint, point);
        return false;
      }
    },
    pointMove: (e: PointWatcherEvent) => {
      const { point } = e;
      const activeThumbType = sharer.getSharedStorage(keyActiveThumbType);
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        sharer.setSharedStorage(keyActivePoint, point);
        if (activeThumbType === 'X') {
          scrollX(point);
        } else if (activeThumbType === 'Y') {
          scrollY(point);
        }
        sharer.setSharedStorage(keyPrevPoint, point);
        return false;
      }
    },
    pointEnd: () => {
      const activeThumbType = sharer.getSharedStorage(keyActiveThumbType);
      clear();
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        viewer.scroll({ moveX: 0, moveY: 0 });
        viewer.drawFrame();
        return false;
      }
    },
    beforeDrawFrame({ snapshot }) {
      const { xThumbRect, yThumbRect } = drawScroller(helperContext, { snapshot });
      sharer.setSharedStorage(keyXThumbRect, xThumbRect);
      sharer.setSharedStorage(keyYThumbRect, yThumbRect);
    }
  };
};
