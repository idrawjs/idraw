import type { Point, PointWatcherEvent, BoardMiddleware, ElementSize } from '@idraw/types';
import { drawPointWrapper, drawHoverWrapper, drawElementControllers, drawElementListShadows } from './draw-wrapper';

export const MiddlewareSelector: BoardMiddleware = (opts) => {
  const { viewer, sharer, viewContent, calculator } = opts;
  const { helperContext } = viewContent;
  // let actionType: 'click' | 'drag' | 'hover' | null = null;

  const key = 'SELECT';
  const keyHoverElementSize = `${key}_hoverElementSize`;
  const keyActionType = `${key}_actionType`;
  sharer.setSharedStorage(keyActionType, null);

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

  viewer.drawFrame();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      if (sharer.getSharedStorage(keyActionType) === 'drag') {
        sharer.setSharedStorage(keyHoverElementSize, null);
      } else if (data) {
        const result = calculator.getPointElement(helperContext, e.point, data, getScaleInfo());
        if (result.element) {
          const { x, y, w, h, angle } = result.element;
          // const { x, y, w, h, angle } = calculator.elementSize(result.element, getScaleInfo());
          sharer.setSharedStorage(keyHoverElementSize, { x, y, w, h, angle });
          viewer.drawFrame();
          return;
        } else if (sharer.getSharedStorage(keyHoverElementSize)) {
          sharer.setSharedStorage(keyHoverElementSize, null);
          viewer.drawFrame();
          return;
        }
      }
    },
    pointStart: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      if (data) {
        const result = calculator.getPointElement(helperContext, e.point, data, getScaleInfo());
        sharer.setActiveStorage('selectedIndexs', result.index >= 0 ? [result.index] : []);
      }
      if (getIndex() >= 0) {
        sharer.setSharedStorage(keyActionType, 'drag');
        prevPoint = e.point;
      } else if (sharer.getSharedStorage(keyActionType) !== null || sharer.getSharedStorage(keyHoverElementSize) !== null) {
        sharer.setSharedStorage(keyActionType, null);
        sharer.setSharedStorage(keyHoverElementSize, null);
        viewer.drawFrame();
      }
    },
    pointMove: (e: PointWatcherEvent) => {
      if (sharer.getSharedStorage(keyActionType) !== 'drag') {
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
    pointEnd(e: PointWatcherEvent) {
      sharer.setSharedStorage(keyActionType, 'click');
      viewer.drawFrame();
    },

    beforeDrawFrame({ snapshot }) {
      const { activeStore, sharedStore } = snapshot;
      const { data, selectedIndexs, scale, offsetLeft, offsetTop, offsetRight, offsetBottom } = activeStore;

      const hoverElement: ElementSize = sharedStore[keyHoverElementSize];
      const drawOpts = { calculator, scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      if (hoverElement) {
        drawHoverWrapper(helperContext, hoverElement, drawOpts);
      }

      if (data?.elements?.[selectedIndexs?.[0]]) {
        const elem = data?.elements?.[selectedIndexs?.[0]];
        drawPointWrapper(helperContext, elem, drawOpts);
        drawElementControllers(helperContext, elem, drawOpts);
      }
      // drawElementListShadows(helperContext, data?.elements || [], drawOpts);
    }
  };
};
