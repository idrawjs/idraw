import { getSelectedElementIndexes, getSelectedElements, calcElementsViewInfo } from '@idraw/util';
import type { Point, PointWatcherEvent, BoardMiddleware, ElementSize } from './types';
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

  sharer.setSharedStorage(keyActionType, null);

  const getIndexes = () => {
    const data = sharer.getActiveStorage('data');
    if (data) {
      const uuids = sharer.getActiveStorage('selectedUUIDs');
      const idxes: Array<number | string> = getSelectedElementIndexes(data, uuids);
      return idxes;
    } else {
      return [];
    }
  };

  const getActiveElements = () => {
    const data = sharer.getActiveStorage('data');
    if (data) {
      const uuids = sharer.getActiveStorage('selectedUUIDs');
      const elems = getSelectedElements(data, uuids);
      return elems;
    } else {
      return [];
    }
  };

  const clear = () => {
    sharer.setSharedStorage(keyActionType, null);
    sharer.setSharedStorage(keyHoverElementSize, null);
    sharer.setSharedStorage(keyResizeType, null);
    sharer.setSharedStorage(keyAreaStart, null);
    sharer.setSharedStorage(keyAreaEnd, null);
  };

  clear();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      if (resizeType || ['area', 'drag', 'drag-list'].includes(actionType)) {
        sharer.setSharedStorage(keyHoverElementSize, null);
        return;
      }

      if (actionType === 'drag') {
        sharer.setSharedStorage(keyHoverElementSize, null);
      } else if (data) {
        const selectedElements = getActiveElements();
        const scaleInfo = sharer.getActiveScaleInfo();
        const viewSize = sharer.getActiveViewSizeInfo();
        const target = getPointTarget(e.point, {
          ctx: helperContext,
          data,
          selectedIndexes: getIndexes(),
          selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
          selectedElements: selectedElements,
          scaleInfo,
          viewSize,
          calculator,
          areaSize: calcSelectedElementsArea(selectedElements, {
            scaleInfo,
            viewSize,
            calculator
          })
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
      // reset all shared storage
      // clear();
      sharer.setSharedStorage(keyHoverElementSize, null);
      const data = sharer.getActiveStorage('data');
      const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
        scaleInfo: sharer.getActiveScaleInfo(),
        viewSize: sharer.getActiveViewSizeInfo(),
        calculator
      });
      const target = getPointTarget(e.point, {
        ctx: helperContext,
        data,
        selectedIndexes: getIndexes(),
        selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
        selectedElements: getActiveElements(),
        scaleInfo: sharer.getActiveScaleInfo(),
        viewSize: sharer.getActiveViewSizeInfo(),
        calculator,
        areaSize: listAreaSize
      });

      if (target.type === 'list-area') {
        sharer.setSharedStorage(keyActionType, 'drag-list');
      } else if (target.type === 'over-element' && target?.uuids?.length === 1 && target?.elements?.length === 1) {
        sharer.setActiveStorage('selectedUUIDs', target?.uuids[0] ? [target?.uuids[0]] : []);
        sharer.setSharedStorage(keyActionType, 'drag');
      } else if (target.type?.startsWith('resize-')) {
        sharer.setSharedStorage(keyResizeType, target.type);
        sharer.setSharedStorage(keyActionType, 'resize');
      } else {
        clear();
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
        sharer.setActiveStorage('selectedUUIDs', []);
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
        if (data && elems?.length === 1 && indexes?.length === 1 && typeof indexes[0] === 'number' && indexes[0] >= 0 && start && end) {
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
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          indexes.forEach((idx: number | string) => {
            if (typeof idx === 'number' && data.elements[idx]) {
              data.elements[idx].x += moveX;
              data.elements[idx].y += moveY;
            }
          });

          sharer.setActiveStorage('data', data);
          prevPoint = e.point;
        } else {
          prevPoint = null;
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (
          data &&
          elems?.length === 1 &&
          indexes?.length === 1 &&
          typeof indexes[0] === 'number' &&
          indexes[0] >= 0 &&
          start &&
          resizeType?.startsWith('resize-')
        ) {
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
      const scaleInfo = sharer.getActiveScaleInfo();
      const viewSize = sharer.getActiveViewSizeInfo();
      const { scale, offsetLeft, offsetTop } = scaleInfo;
      const { width, height, contextHeight, contextWidth, contextX, contextY } = viewSize;
      let needDrawFrame = false;

      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyActionType, null);
        if (data) {
          const start = sharer.getSharedStorage(keyAreaStart);
          const end = sharer.getSharedStorage(keyAreaEnd);
          const { uuids } = getSelectedListArea(data, {
            start,
            end,
            calculator,
            scaleInfo: sharer.getActiveScaleInfo(),
            viewSize: sharer.getActiveViewSizeInfo()
          });

          if (uuids.length > 0) {
            sharer.setActiveStorage('selectedUUIDs', uuids);
            sharer.setSharedStorage(keyActionType, 'drag-list');
            needDrawFrame = true;
          }
        }
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyActionType, 'drag-list-end');
        needDrawFrame = true;
      } else if (data) {
        const result = calculator.getPointElement(e.point, data, sharer.getActiveScaleInfo(), sharer.getActiveViewSizeInfo());
        if (result.element) {
          sharer.setSharedStorage(keyActionType, 'select');
          needDrawFrame = true;
        } else {
          sharer.setSharedStorage(keyActionType, null);
        }
      }
      if (sharer.getSharedStorage(keyActionType) === null) {
        clear();
        needDrawFrame = true;
      }

      const finalDrawFrame = () => {
        if (!needDrawFrame) {
          return;
        }
        if (data && Array.isArray(data?.elements) && ['drag', 'drag-list'].includes(actionType)) {
          const viewInfo = calcElementsViewInfo(data.elements, viewSize, { extend: true });
          sharer.setActiveStorage('contextX', viewInfo.contextSize.contextX);
          sharer.setActiveStorage('contextY', viewInfo.contextSize.contextY);
          sharer.setActiveStorage('contextHeight', viewInfo.contextSize.contextHeight);
          sharer.setActiveStorage('contextWidth', viewInfo.contextSize.contextWidth);
          viewer.scrollX(offsetLeft + viewInfo.changeContextLeft);
          viewer.scrollY(offsetTop + viewInfo.changeContextTop);
        }
        viewer.drawFrame();
      };

      finalDrawFrame();
    },

    pointLeave() {
      clear();
      viewer.drawFrame();
    },

    beforeDrawFrame({ snapshot }) {
      const { activeStore, sharedStore } = snapshot;
      const {
        data,
        selectedUUIDs,
        scale,
        offsetLeft,
        offsetTop,
        offsetRight,
        offsetBottom,
        width,
        height,
        contextX,
        contextY,
        contextHeight,
        contextWidth,
        devicePixelRatio
      } = activeStore;
      const scaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      const viewSize = { width, height, contextX, contextY, contextHeight, contextWidth, devicePixelRatio };
      // const elem = data?.elements?.[selectedIndexes?.[0] as number];
      const selectedElements = getSelectedElements(data, selectedUUIDs);
      const elem = selectedElements[0];
      const hoverElement: ElementSize = sharedStore[keyHoverElementSize];
      const actionType: string = sharedStore[keyActionType];
      const areaStart: Point | null = sharedStore[keyAreaStart];
      const areaEnd: Point | null = sharedStore[keyAreaEnd];

      const drawOpts = { calculator, scaleInfo, viewSize };
      if (hoverElement && actionType !== 'drag') {
        const hoverElemSize = calculator.elementSize(hoverElement, scaleInfo, viewSize);
        drawHoverWrapper(helperContext, hoverElemSize);
      }

      if (elem && ['select', 'drag', 'resize'].includes(actionType)) {
        const selectedElemSize = calculator.elementSize(elem, scaleInfo, viewSize);
        const sizeControllers = calcElementControllerStyle(selectedElemSize);
        drawPointWrapper(helperContext, selectedElemSize);
        drawElementControllers(helperContext, selectedElemSize, { ...drawOpts, sizeControllers });
      } else if (actionType === 'area' && areaStart && areaEnd) {
        drawArea(helperContext, { start: areaStart, end: areaEnd });
      } else if (['drag-list', 'drag-list-end'].includes(actionType)) {
        const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
          scaleInfo: sharer.getActiveScaleInfo(),
          viewSize: sharer.getActiveViewSizeInfo(),
          calculator
        });
        if (listAreaSize) {
          drawListArea(helperContext, { areaSize: listAreaSize });
        }
      }
    }
  };
};
