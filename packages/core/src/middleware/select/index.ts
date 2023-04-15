import type { Point, PointWatcherEvent, BoardMiddleware } from '@idraw/types';
import { createBoardContexts } from '@idraw/util';
import { drawPointWrapper, drawHoverWrapper } from './draw-wrapper';

export const MiddlewareSelector: BoardMiddleware = (opts) => {
  const { viewer, sharer, viewContent, calculator } = opts;
  const { helperContext } = viewContent;

  const key = 'SELECT';
  const keyHoverElementSize = `${key}_hoverElementSize`;
  const keySelectType = `${key}_type`; // 'default' | 'hover' | 'drag'

  const getIndex = () => {
    const idx = sharer.getActiveStorage('selectedIndexs')[0];
    return idx >= 0 ? idx : -1;
  };

  const getScaleInfo = () => {
    return {
      scale: sharer.getActiveStorage('scale'),
      offsetLeft: sharer.getActiveStorage('offsetLeft'),
      offsetRight: sharer.getActiveStorage('offsetRight'),
      offsetTop: sharer.getActiveStorage('offsetTop'),
      offsetBottom: sharer.getActiveStorage('offsetBottom')
    };
  };

  const getActiveElem = () => {
    const index = getIndex();
    const storeData = sharer.getActiveStorage('data');
    return storeData?.elements?.[index] || null;
  };

  let prevPoint: Point | null = null;
  let isDrag = false;

  viewer.drawFrame();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      if (!isDrag) {
        const data = sharer.getActiveStorage('data');
        if (data) {
          const result = calculator.getPointElement(e.point, data, getScaleInfo());
          if (result.element) {
            const { x, y, w, h } = result.element;
            sharer.setSharedStorage(keySelectType, 'hover');
            sharer.setSharedStorage(keyHoverElementSize, { x, y, w, h });
            viewer.drawFrame();
            return;
          }
        }
        if (sharer.getSharedStorage(keySelectType) === 'hover') {
          sharer.setSharedStorage(keySelectType, 'default');
          sharer.setSharedStorage(keyHoverElementSize, null);
          viewer.drawFrame();
        }
      }
    },
    pointStart: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      if (data) {
        const result = calculator.getPointElement(e.point, data, getScaleInfo());
        sharer.setActiveStorage('selectedIndexs', result.index >= 0 ? [result.index] : []);
      }
      if (getIndex() >= 0) {
        sharer.setSharedStorage(keySelectType, 'drag');
        isDrag = true;
        prevPoint = e.point;
      }
    },
    pointMove: (e: PointWatcherEvent) => {
      if (!isDrag) {
        return;
      }
      const data = sharer.getActiveStorage('data');

      const index = getIndex();
      const elem = getActiveElem();
      const scale = sharer.getActiveStorage('scale') || 1;
      const startPoint = prevPoint;
      const endPoint = e.point;
      if (data && elem && index >= 0 && startPoint && endPoint) {
        data.elements[index].x += (endPoint.x - startPoint.x) / scale;
        data.elements[index].y += (endPoint.y - startPoint.y) / scale;
        sharer.setActiveStorage('data', data);
        prevPoint = e.point;
      } else {
        prevPoint = null;
      }
      viewer.drawFrame();
    },
    pointEnd: (e: PointWatcherEvent) => {
      sharer.setActiveStorage('selectedIndexs', []);
      isDrag = false;
    },

    beforeDrawFrame({ snapshot }) {
      const { activeStore, sharedStore } = snapshot;
      const { data, selectedIndexs, scale, offsetLeft, offsetTop, offsetRight, offsetBottom } = activeStore;
      const selectType = sharedStore[keySelectType];
      const hoverElement = sharedStore[keyHoverElementSize];
      const drawOpts = { calculator, scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      if (selectType === 'hover' && hoverElement) {
        drawHoverWrapper(helperContext, hoverElement, drawOpts);
      } else if (selectType === 'drag' && data?.elements?.[selectedIndexs?.[0]]) {
        drawPointWrapper(helperContext, data?.elements?.[selectedIndexs?.[0]], drawOpts);
      }
    }
  };
};
