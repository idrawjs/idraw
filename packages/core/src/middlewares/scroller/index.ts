import type {
  Point,
  Middleware,
  PointWatcherEvent,
  BoardWatherWheelEvent,
  MiddlewareScrollerConfig,
} from '@idraw/types';
import { coreEventKeys } from '../../static';
import {
  keyXThumbStyle,
  keyYThumbStyle,
  keyPrevPoint,
  keyActivePoint,
  keyActiveThumbType,
  defaultStyles,
  getRootClassName,
  scrollbarTrackSize,
  scrollbarThumbLength,
} from './static';
import type { DeepScrollerSharedStorage } from './types';
import { initStyles, destroyStyles, getMiddlewareScrollerStyles } from './styles';
import { initRoot, isInScrollbar, updateScrollbarStyles, getThumbType } from './dom';
import { calcScrollbarStyles } from './util';

export { getMiddlewareScrollerStyles };

export const MiddlewareScroller: Middleware<DeepScrollerSharedStorage, any, MiddlewareScrollerConfig> = (
  opts,
  config
) => {
  const { viewer, sharer, eventHub } = opts;
  let isBusy: boolean = false;

  let innerConfig = {
    ...defaultStyles,
    ...config,
  };

  const styles = getMiddlewareScrollerStyles(innerConfig);
  const rootClassName = getRootClassName();
  let $horizontal: HTMLDivElement | null = null;
  let $vertical: HTMLDivElement | null = null;

  const clear = () => {
    sharer.setSharedStorage(keyPrevPoint, null); // null | Point;
    sharer.setSharedStorage(keyActivePoint, null); // null | Point;
    sharer.setSharedStorage(keyActiveThumbType, null); // null | 'X' | 'Y'

    isBusy = false;
  };

  clear();

  const updateScrollbar = () => {
    const { xThumbStyle, yThumbStyle } = calcScrollbarStyles({
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
    });
    sharer.setSharedStorage(keyXThumbStyle, xThumbStyle);
    sharer.setSharedStorage(keyYThumbStyle, yThumbStyle);
  };

  const updateMovingScrollbar = (opts: { thumbMoveX: number; thumbMoveY: number }) => {
    const { thumbMoveX, thumbMoveY } = opts;
    const xThumbStyle = sharer.getSharedStorage(keyXThumbStyle);
    const yThumbStyle = sharer.getSharedStorage(keyYThumbStyle);
    const viewSizeInfo = sharer.getActiveViewSizeInfo();
    if (xThumbStyle && (thumbMoveX > 0 || thumbMoveX < 0)) {
      const maxScrollWidth = viewSizeInfo.width - scrollbarTrackSize * 2;
      const minLeft = scrollbarTrackSize;
      let left = (xThumbStyle.left as number) - thumbMoveX;
      left = Math.min(
        viewSizeInfo.width - scrollbarTrackSize - scrollbarThumbLength,
        Math.max(scrollbarTrackSize, left)
      );

      let width = xThumbStyle.width as number;
      if (left + width >= maxScrollWidth || left <= minLeft) {
        if (thumbMoveX < 0) {
          width += thumbMoveX;
        } else {
          width -= thumbMoveX;
        }
      }

      width = Math.min(maxScrollWidth, Math.max(scrollbarThumbLength, width));

      xThumbStyle.left = left;
      xThumbStyle.width = width;
      sharer.setSharedStorage(keyXThumbStyle, xThumbStyle);
    }

    if (yThumbStyle && (thumbMoveY > 0 || thumbMoveY < 0)) {
      const maxScrollHeight = viewSizeInfo.height - scrollbarTrackSize * 2;
      const minTop = scrollbarTrackSize;
      let top = (yThumbStyle.top as number) - thumbMoveY;
      top = Math.min(
        viewSizeInfo.height - scrollbarTrackSize - scrollbarThumbLength,
        Math.max(scrollbarTrackSize, top)
      );

      let height = yThumbStyle.height as number;
      if (top + height >= maxScrollHeight || top <= minTop) {
        if (thumbMoveY < 0) {
          height += thumbMoveY;
        } else {
          height -= thumbMoveY;
        }
      }

      height = Math.min(maxScrollHeight, Math.max(scrollbarThumbLength, height));

      yThumbStyle.top = top;
      yThumbStyle.height = height;
      sharer.setSharedStorage(keyYThumbStyle, yThumbStyle);
    }
  };

  const scrollX = (p: Point) => {
    const prevPoint: null | Point = sharer.getSharedStorage(keyPrevPoint);
    if (prevPoint) {
      const { offsetLeft, offsetRight } = sharer.getActiveViewScaleInfo();
      const { width } = sharer.getActiveViewSizeInfo();
      const thumbMoveX = -(p.x - prevPoint.x);
      const totalWidth = width + Math.abs(offsetLeft) + Math.abs(offsetRight);
      const moveX = (thumbMoveX * totalWidth) / width;
      viewer.scroll({ moveX });
      updateMovingScrollbar({ thumbMoveX, thumbMoveY: 0 });
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
      updateMovingScrollbar({ thumbMoveX: 0, thumbMoveY });
      viewer.drawFrame();
    }
  };

  return {
    name: '@middleware/scroller',

    use() {
      initStyles(rootClassName, styles);
      const initedResult = initRoot({ rootClassName, $container: opts.container as HTMLElement });
      $horizontal = initedResult.$horizontal;
      $vertical = initedResult.$vertical;

      // init styles
      updateScrollbar();
      updateScrollbarStyles({
        xThumbStyle: sharer.getSharedStorage(keyXThumbStyle),
        yThumbStyle: sharer.getSharedStorage(keyYThumbStyle),
        $horizontal,
        $vertical,
      });
    },

    disuse() {
      destroyStyles(rootClassName);
      // clear dom
      $horizontal?.remove();
      $horizontal = null;
      $vertical?.remove();
      $vertical = null;
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    wheel: (e: BoardWatherWheelEvent) => {
      viewer.scroll({
        moveX: 0 - e.deltaX,
        moveY: 0 - e.deltaY,
      });
      updateScrollbar();
      viewer.drawFrame();
    },

    hover: (e: PointWatcherEvent) => {
      if (isBusy === true) {
        return false;
      }
      const { nativeEvent } = e;
      const thumbType = getThumbType(nativeEvent);
      if (thumbType === 'X' || thumbType === 'Y') {
        eventHub.trigger(coreEventKeys.CURSOR, { type: 'default' });
        return false;
      }

      if (isInScrollbar(nativeEvent)) {
        return false;
      }
    },

    pointStart: (e: PointWatcherEvent) => {
      const { point, nativeEvent } = e;
      const thumbType = getThumbType(nativeEvent);
      if (thumbType === 'X' || thumbType === 'Y') {
        isBusy = true;
        sharer.setSharedStorage(keyActiveThumbType, thumbType);
        sharer.setSharedStorage(keyPrevPoint, point);
        return false;
      }

      if (isInScrollbar(nativeEvent)) {
        return false;
      }
    },

    pointMove: (e: PointWatcherEvent) => {
      const { point, nativeEvent } = e;
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
      if (isInScrollbar(nativeEvent)) {
        return false;
      }
    },
    pointEnd: () => {
      isBusy = false;
      const activeThumbType = sharer.getSharedStorage(keyActiveThumbType);
      clear();
      if (activeThumbType === 'X' || activeThumbType === 'Y') {
        viewer.scroll({ moveX: 0, moveY: 0 });
        updateScrollbar();
        viewer.drawFrame();
        return false;
      }
    },
    beforeDrawFrame() {
      updateScrollbarStyles({
        $horizontal,
        $vertical,
        xThumbStyle: sharer.getSharedStorage(keyXThumbStyle),
        yThumbStyle: sharer.getSharedStorage(keyYThumbStyle),
      });
    },
  };
};
