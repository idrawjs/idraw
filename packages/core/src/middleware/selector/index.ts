import type { Point, PointWatcherEvent, BoardMiddleware, Element, ElementSize, ElementType, AreaSize } from './types';
import { drawPointWrapper, drawHoverWrapper, drawElementControllers, drawArea, drawListArea } from './draw-wrapper';
import { calcElementControllerStyle } from './controller';
import { getPointTarget, resizeElement, getSelectedListArea, calcSelectedElementsArea } from './util';

export const MiddlewareSelector: BoardMiddleware = (opts) => {
  const { viewer, sharer, viewContent, calculator } = opts;
  const { helperContext } = viewContent;
  let prevPoint: Point | null = null;

  const key = 'SELECT';
  const keyHoverElementSize = `${key}_hoverElementSize`;
  const keyActionType = `${key}_actionType`; // 'select' | 'drag-list' | 'drag-list-end' | 'drag' | 'hover' | 'resize' | 'area' | null = null;
  const keyResizeType = `${key}_resizeType`; // ResizeType | null;
  const keyAreaStart = `${key}_areaStart`; // Point
  const keyAreaEnd = `${key}_areaEnd`; // Point
  const keyListAreaSize = `${key}_areaSize`; // AreaSize (ElementSize)

  sharer.setSharedStorage(keyActionType, null);

  const getIndexes = () => {
    const idxs = sharer.getActiveStorage('selectedIndexes') || [];
    return idxs;
  };

  const getActiveElements = () => {
    const indexes = getIndexes();
    const elemList: Element<ElementType>[] = [];
    const data = sharer.getActiveStorage('data');
    if (!data || !(indexes.length > 0)) {
      return elemList;
    }
    indexes?.forEach((idx: number) => {
      if (data?.elements[idx]) {
        elemList.push(data?.elements[idx]);
      }
    });
    return elemList;
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

  const clear = () => {
    sharer.setSharedStorage(keyActionType, null);
    sharer.setSharedStorage(keyHoverElementSize, null);
    sharer.setSharedStorage(keyResizeType, null);
    sharer.setSharedStorage(keyAreaStart, null);
    sharer.setSharedStorage(keyAreaEnd, null);
    sharer.setSharedStorage(keyListAreaSize, null);
  };

  clear();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const listAreaSize = sharer.getSharedStorage(keyListAreaSize);
      if (resizeType || ['area', 'drag', 'drag-list'].includes(actionType)) {
        sharer.setSharedStorage(keyHoverElementSize, null);
        return;
      }

      if (actionType === 'drag') {
        sharer.setSharedStorage(keyHoverElementSize, null);
      } else if (data) {
        const target = getPointTarget(e.point, {
          ctx: helperContext,
          data,
          selectedIndexes: getIndexes(),
          selectedElements: getActiveElements(),
          scaleInfo: getScaleInfo(),
          calculator,
          areaSize: listAreaSize
        });
        if (target.type === 'over-element' && target?.elements?.length === 1) {
          const { x, y, w, h, angle } = target.elements[0];
          sharer.setSharedStorage(keyHoverElementSize, { x, y, w, h, angle });
          viewer.drawFrame();
          return;
        }
        if (sharer.getSharedStorage(keyHoverElementSize)) {
          sharer.setSharedStorage(keyHoverElementSize, null);
          viewer.drawFrame();
          return;
        }
      }
    },

    pointStart: (e: PointWatcherEvent) => {
      const listAreaSize = sharer.getSharedStorage(keyListAreaSize);

      // reset all shared storage
      // clear();
      sharer.setSharedStorage(keyHoverElementSize, null);

      const data = sharer.getActiveStorage('data');
      const target = getPointTarget(e.point, {
        ctx: helperContext,
        data,
        selectedIndexes: getIndexes(),
        selectedElements: getActiveElements(),
        scaleInfo: getScaleInfo(),
        calculator,
        areaSize: listAreaSize
      });

      if (target.type === 'list-area') {
        sharer.setSharedStorage(keyActionType, 'drag-list');
      } else if (target.type === 'over-element' && target?.indexes?.length === 1 && target.indexes[0] >= 0 && target?.elements?.length === 1) {
        sharer.setActiveStorage('selectedIndexes', target?.indexes[0] >= 0 ? [target?.indexes[0]] : []);
        sharer.setSharedStorage(keyActionType, 'drag');
      } else if (target.type?.startsWith('resize-')) {
        sharer.setSharedStorage(keyResizeType, target.type);
        sharer.setSharedStorage(keyActionType, 'resize');
      } else {
        clear();
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
      }
      if (target.type) {
        prevPoint = e.point;
      } else {
        prevPoint = null;
      }
      viewer.drawFrame();
    },

    pointMove: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      const indexes = getIndexes();
      const elems = getActiveElements();
      const scale = sharer.getActiveStorage('scale') || 1;
      const start = prevPoint;
      const end = e.point;
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);

      if (actionType === 'drag') {
        if (data && elems?.length === 1 && indexes?.length === 1 && indexes[0] >= 0 && start && end) {
          data.elements[indexes[0]].x += (end.x - start.x) / scale;
          data.elements[indexes[0]].y += (end.y - start.y) / scale;
          sharer.setActiveStorage('data', data);
          prevPoint = e.point;
        } else {
          prevPoint = null;
        }
        viewer.drawFrame();
      } else if (actionType === 'drag-list') {
        if (data && start && end && indexes?.length > 1) {
          const listAreaSize = sharer.getSharedStorage(keyListAreaSize);
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          indexes.forEach((idx: number) => {
            if (data.elements[idx]) {
              data.elements[idx].x += moveX;
              data.elements[idx].y += moveY;
            }
          });
          if (listAreaSize) {
            listAreaSize.x += moveX;
            listAreaSize.y += moveY;
          }

          const newAreaSize = calcSelectedElementsArea(getActiveElements(), {
            scaleInfo: sharer.getActiveScaleInfo(),
            calculator
          });

          sharer.setActiveStorage('data', data);
          sharer.setSharedStorage(keyListAreaSize, newAreaSize);
          prevPoint = e.point;
        } else {
          prevPoint = null;
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (data && elems?.length === 1 && indexes?.length === 1 && indexes[0] >= 0 && start && resizeType?.startsWith('resize-')) {
          const resizedElemSize = resizeElement(elems[0], { scale, start, end, resizeType });
          data.elements[indexes[0]].x = resizedElemSize.x;
          data.elements[indexes[0]].y = resizedElemSize.y;
          data.elements[indexes[0]].w = resizedElemSize.w;
          data.elements[indexes[0]].h = resizedElemSize.h;
          prevPoint = e.point;
          viewer.drawFrame();
        }
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyAreaEnd, e.point);
        viewer.drawFrame();
      }
    },

    pointEnd(e: PointWatcherEvent) {
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);

      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyActionType, null);
        if (data) {
          const start = sharer.getSharedStorage(keyAreaStart);
          const end = sharer.getSharedStorage(keyAreaEnd);
          const { indexes, area } = getSelectedListArea(data, {
            start,
            end,
            calculator,
            scaleInfo: sharer.getActiveScaleInfo()
          });

          if (indexes.length > 0) {
            sharer.setSharedStorage(keyListAreaSize, area);
            sharer.setActiveStorage('selectedIndexes', indexes);
            sharer.setSharedStorage(keyActionType, 'drag-list');
            viewer.drawFrame();
          }
        }
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyActionType, 'drag-list-end');
        viewer.drawFrame();
      } else if (data) {
        const result = calculator.getPointElement(e.point, data, sharer.getActiveScaleInfo());
        if (result.element) {
          sharer.setSharedStorage(keyActionType, 'select');
          viewer.drawFrame();
        } else {
          sharer.setSharedStorage(keyActionType, null);
        }
      }
      if (sharer.getSharedStorage(keyActionType) === null) {
        clear();
        viewer.drawFrame();
      }
    },

    pointLeave() {
      clear();
      viewer.drawFrame();
    },

    beforeDrawFrame({ snapshot }) {
      const { activeStore, sharedStore } = snapshot;
      const { data, selectedIndexes, scale, offsetLeft, offsetTop, offsetRight, offsetBottom, width, height, contextHeight, contextWidth, devicePixelRatio } =
        activeStore;
      const scaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      const viewSize = { width, height, contextHeight, contextWidth, devicePixelRatio };
      const elem = data?.elements?.[selectedIndexes?.[0]];
      const hoverElement: ElementSize = sharedStore[keyHoverElementSize];
      const actionType: string = sharedStore[keyActionType];
      const areaStart: Point | null = sharedStore[keyAreaStart];
      const areaEnd: Point | null = sharedStore[keyAreaEnd];
      const listAreaSize: AreaSize | null = sharedStore[keyListAreaSize];

      const drawOpts = { calculator, scaleInfo, viewSize };
      if (hoverElement && actionType !== 'drag') {
        const hoverElemSize = calculator.elementSize(hoverElement, scaleInfo);
        drawHoverWrapper(helperContext, hoverElemSize, drawOpts);
      }

      if (elem && ['select', 'drag', 'resize'].includes(actionType)) {
        const selectedElemSize = calculator.elementSize(elem, scaleInfo);
        const sizeControllers = calcElementControllerStyle(selectedElemSize);
        drawPointWrapper(helperContext, selectedElemSize, drawOpts);
        drawElementControllers(helperContext, selectedElemSize, { ...drawOpts, sizeControllers });
      } else if (actionType === 'area' && areaStart && areaEnd) {
        drawArea(helperContext, { start: areaStart, end: areaEnd });
      } else if (['drag-list', 'drag-list-end'].includes(actionType) && listAreaSize) {
        drawListArea(helperContext, { areaSize: listAreaSize });
      }
    }
  };
};
