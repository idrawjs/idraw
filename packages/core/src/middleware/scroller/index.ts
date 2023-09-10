import type { ElementSize } from '@idraw/types';
import type { Point, BoardMiddleware, PointWatcherEvent, BoardWatherWheelXEvent, BoardWatherWheelYEvent } from '@idraw/types';
import { drawScroller, isPointInScrollThumb } from './util';
// import type { ScrollbarThumbType } from './util';
import { key, keyXThumbRect, keyYThumbRect, keyPrevPoint, keyActivePoint, keyActiveThumbType } from './config';

export const MiddlewareScroller: BoardMiddleware = (opts) => {
  const { viewer, viewContent, sharer } = opts;
  const { helperContext } = viewContent;
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
    mode: key,
    // hover: (e: PointWatcherEvent) => {
    //   const { point } = e;
    //   const thumbType = getThumbType(point);
    //   if (thumbType === 'X' || thumbType === 'Y') {
    //     return false;
    //   }
    // },
    wheelX: (e: BoardWatherWheelXEvent) => {
      if (e.deltaX >= 0 || e.deltaX < 0) {
        viewer.scroll({ moveX: 0 - e.deltaX });
        viewer.drawFrame();
      }
    },
    wheelY: (e: BoardWatherWheelYEvent) => {
      if (e.deltaY >= 0 || e.deltaY < 0) {
        viewer.scroll({ moveY: 0 - e.deltaY });
        viewer.drawFrame();
      }
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
    pointEnd: (e: PointWatcherEvent) => {
      // const { point } = e;
      // if (activeThumbType === 'X' || activeThumbType === 'Y') {
      //   if (activeThumbType === 'X') {
      //     scrollX(point);
      //   } else if (activeThumbType === 'Y') {
      //     scrollY(point);
      //   }
      //   activeThumbType = null;
      //   return false;
      // }
      clear();
    },
    beforeDrawFrame({ snapshot }) {
      const { xThumbRect, yThumbRect } = drawScroller(helperContext, { snapshot });
      sharer.setSharedStorage(keyXThumbRect, xThumbRect);
      sharer.setSharedStorage(keyYThumbRect, yThumbRect);
    }
  };
};
