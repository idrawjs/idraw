import { getSelectedElementIndexes, getSelectedElements, calcElementsViewInfo } from '@idraw/util';
import type { Point, PointWatcherEvent, BoardMiddleware, Element, ElementSize, ActionType, ResizeType, DeepSelectorSharedStorage } from './types';
import { drawPointWrapper, drawHoverWrapper, drawElementControllers, drawArea, drawListArea, drawGroupsWrapper, drawHoverWrapperInGroup } from './draw-wrapper';
import { calcElementControllerStyle } from './controller';
import { getPointTarget, resizeElement, getSelectedListArea, calcSelectedElementsArea, isElementInGroup, isPointInViewActiveGroup } from './util';
import { key, keyHoverElementSize, keyActionType, keyResizeType, keyAreaStart, keyAreaEnd, keyGroupQueue, keyInGroup } from './config';

export const MiddlewareSelector: BoardMiddleware<DeepSelectorSharedStorage> = (opts) => {
  const { viewer, sharer, viewContent, calculator } = opts;
  const { helperContext } = viewContent;
  let prevPoint: Point | null = null;

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

  const pushGroupQueue = (elem: Element<'group'>) => {
    let groupQueue = sharer.getSharedStorage(keyGroupQueue);
    if (!Array.isArray(groupQueue)) {
      groupQueue = [];
    }
    if (groupQueue.length > 0) {
      if (isElementInGroup(elem, groupQueue[groupQueue.length - 1])) {
        groupQueue.push(elem);
      } else {
        groupQueue = [];
      }
    } else if (groupQueue.length === 0) {
      groupQueue.push(elem);
    }
    sharer.setSharedStorage(keyGroupQueue, groupQueue);
    return groupQueue.length > 0;
  };

  const clear = () => {
    sharer.setSharedStorage(keyActionType, null);
    sharer.setSharedStorage(keyHoverElementSize, null);
    sharer.setSharedStorage(keyResizeType, null);
    sharer.setSharedStorage(keyAreaStart, null);
    sharer.setSharedStorage(keyAreaEnd, null);
    sharer.setSharedStorage(keyGroupQueue, null);
    sharer.setSharedStorage(keyInGroup, null);
  };

  clear();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);

      if (sharer.getSharedStorage(keyInGroup) === true) {
        // in group
        // TODO
        if (
          !isPointInViewActiveGroup(e.point, {
            ctx: helperContext,
            viewScaleInfo: sharer.getActiveScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            groupQueue: sharer.getSharedStorage(keyGroupQueue)
          })
        ) {
          return;
        }

        const target = getPointTarget(e.point, {
          ctx: helperContext,
          data,
          selectedIndexes: getIndexes(),
          selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
          selectedElements: getActiveElements(),
          viewScaleInfo: sharer.getActiveScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
          calculator,
          areaSize: null,
          groupQueue: sharer.getSharedStorage(keyGroupQueue)
        });

        if (target.type === 'in-group-element') {
          if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
            sharer.setSharedStorage(keyHoverElementSize, null);
            viewer.drawFrame();
            return;
          }
          if (target?.elements?.length === 1) {
            sharer.setSharedStorage(keyHoverElementSize, target.elements[0]);
            viewer.drawFrame();
          }
        } else {
          // TODO
          // sharer.setSharedStorage(keyHoverElementSize, null);
          // viewer.drawFrame();
          // return;
        }
        return;
      }

      // not in group
      if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
        sharer.setSharedStorage(keyHoverElementSize, null);
        return;
      }

      if (actionType === 'drag') {
        sharer.setSharedStorage(keyHoverElementSize, null);
      } else if (data) {
        const selectedElements = getActiveElements();
        const viewScaleInfo = sharer.getActiveScaleInfo();
        const viewSizeInfo = sharer.getActiveViewSizeInfo();
        const target = getPointTarget(e.point, {
          ctx: helperContext,
          data,
          selectedIndexes: getIndexes(),
          selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
          selectedElements: selectedElements,
          viewScaleInfo,
          viewSizeInfo,
          calculator,
          areaSize: calcSelectedElementsArea(selectedElements, {
            viewScaleInfo,
            viewSizeInfo,
            calculator
          }),
          groupQueue: sharer.getSharedStorage(keyGroupQueue)
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
        viewScaleInfo: sharer.getActiveScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator
      });
      const target = getPointTarget(e.point, {
        ctx: helperContext,
        data,
        selectedIndexes: getIndexes(),
        selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
        selectedElements: getActiveElements(),
        viewScaleInfo: sharer.getActiveScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator,
        areaSize: listAreaSize,
        groupQueue: sharer.getSharedStorage(keyGroupQueue)
      });

      // console.log('pointStart target ====== ', sharer.getSharedStorage(keyInGroup), target, sharer.getSharedStorage(keyGroupQueue));

      if (sharer.getSharedStorage(keyInGroup) === true) {
        if (target.type === 'in-group-element' && target?.groupQueue?.length > 0) {
          // TODO
          // sharer.setSharedStorage(keyGroupQueue, target.groupQueue);
          return;
        }
        sharer.setSharedStorage(keyInGroup, false);
        sharer.setActiveStorage('selectedUUIDs', []);
        sharer.setSharedStorage(keyGroupQueue, null);
        // return;
      }

      if (target.type === 'list-area') {
        sharer.setSharedStorage(keyActionType, 'drag-list');
      } else if (target.type === 'over-element' && target?.uuids?.length === 1 && target?.elements?.length === 1) {
        sharer.setActiveStorage('selectedUUIDs', target?.uuids[0] ? [target?.uuids[0]] : []);
        sharer.setSharedStorage(keyActionType, 'drag');
      } else if (target.type?.startsWith('resize-')) {
        sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
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
      const inGroup: boolean | null = sharer.getSharedStorage(keyInGroup);
      const viewScaleInfo = sharer.getActiveScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const { offsetLeft, offsetTop } = viewScaleInfo;
      let needDrawFrame = false;

      if (inGroup === true) {
        return;
      }

      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyActionType, null);
        if (data) {
          const start = sharer.getSharedStorage(keyAreaStart);
          const end = sharer.getSharedStorage(keyAreaEnd);
          if (start && end) {
            const { uuids } = getSelectedListArea(data, {
              start,
              end,
              calculator,
              viewScaleInfo: sharer.getActiveScaleInfo(),
              viewSizeInfo: sharer.getActiveViewSizeInfo()
            });

            if (uuids.length > 0) {
              sharer.setActiveStorage('selectedUUIDs', uuids);
              sharer.setSharedStorage(keyActionType, 'drag-list');
              needDrawFrame = true;
            }
          }
        }
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyActionType, 'drag-list-end');
        needDrawFrame = true;
      } else if (data) {
        const result = calculator.getPointElement(e.point, { data, viewScaleInfo: sharer.getActiveScaleInfo(), viewSizeInfo: sharer.getActiveViewSizeInfo() });
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
        if (data && Array.isArray(data?.elements) && (['drag', 'drag-list'] as ActionType[]).includes(actionType)) {
          const viewInfo = calcElementsViewInfo(data.elements, viewSizeInfo, { extend: true });
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

    doubleClick(e: PointWatcherEvent) {
      const data = sharer.getActiveStorage('data');
      const target = getPointTarget(e.point, {
        ctx: helperContext,
        data,
        selectedIndexes: getIndexes(),
        selectedUUIDs: sharer.getActiveStorage('selectedUUIDs') || [],
        selectedElements: getActiveElements(),
        viewScaleInfo: sharer.getActiveScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator,
        areaSize: null,
        groupQueue: sharer.getSharedStorage(keyGroupQueue)
      });

      // console.log('doubleClick target =====', target);

      if (target.type === 'in-group-element' && target.groupQueue.length > 0) {
        sharer.setSharedStorage(keyGroupQueue, target.groupQueue as Element<'group'>[]);
        sharer.setSharedStorage(keyInGroup, true);
        sharer.setSharedStorage(keyActionType, null);
        viewer.drawFrame();
        return;
      } else if (target.elements.length === 1 && target.elements[0]?.type === 'group') {
        const pushResult = pushGroupQueue(target.elements[0] as Element<'group'>);
        sharer.setSharedStorage(keyInGroup, pushResult);
        if (pushResult === true) {
          sharer.setSharedStorage(keyActionType, null);
          viewer.drawFrame();
          return;
        }
      }
      sharer.setSharedStorage(keyActionType, null);
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

      // // TODO mock start
      // if (data) {
      //   sharer.setSharedStorage(keyInGroup, true);
      //   sharer.setSharedStorage(keyGroupQueue, [
      //     data?.elements?.[0] as Element<'group'>,
      //     (data?.elements?.[0] as Element<'group'>)?.detail?.children[0] as Element<'group'>,
      //     ((data?.elements?.[0] as Element<'group'>)?.detail?.children[0] as Element<'group'>)?.detail?.children[0] as Element<'group'>
      //   ]);
      // }
      // // TODO mock end

      const viewScaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      const viewSizeInfo = { width, height, contextX, contextY, contextHeight, contextWidth, devicePixelRatio };
      // const elem = data?.elements?.[selectedIndexes?.[0] as number];
      const selectedElements = getSelectedElements(data, selectedUUIDs);
      const elem = selectedElements[0];
      const hoverElement: ElementSize = sharedStore[keyHoverElementSize] as ElementSize;
      const actionType: ActionType = sharedStore[keyActionType] as ActionType;
      const areaStart: Point | null = sharedStore[keyAreaStart];
      const areaEnd: Point | null = sharedStore[keyAreaEnd];
      const inGroup: boolean | null = sharedStore[keyInGroup];
      const groupQueue: Element<'group'>[] | null = sharedStore[keyGroupQueue];

      if (inGroup && groupQueue && groupQueue?.length > 0) {
        // in group
        drawGroupsWrapper(helperContext, groupQueue, { viewScaleInfo, viewSizeInfo });
        if (hoverElement && actionType !== 'drag') {
          drawHoverWrapperInGroup(helperContext, hoverElement, groupQueue, { viewScaleInfo, viewSizeInfo });
        }
      } else {
        // in root
        const drawOpts = { calculator, viewScaleInfo, viewSizeInfo };
        if (hoverElement && actionType !== 'drag') {
          const hoverElemSize = calculator.elementSize(hoverElement, viewScaleInfo, viewSizeInfo);
          drawHoverWrapper(helperContext, hoverElemSize);
        }

        if (elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          const selectedElemSize = calculator.elementSize(elem, viewScaleInfo, viewSizeInfo);
          const sizeControllers = calcElementControllerStyle(selectedElemSize);
          drawPointWrapper(helperContext, selectedElemSize);
          drawElementControllers(helperContext, selectedElemSize, { ...drawOpts, sizeControllers });
        } else if (actionType === 'area' && areaStart && areaEnd) {
          drawArea(helperContext, { start: areaStart, end: areaEnd });
        } else if ((['drag-list', 'drag-list-end'] as ActionType[]).includes(actionType)) {
          const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
            viewScaleInfo: sharer.getActiveScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            calculator
          });
          if (listAreaSize) {
            drawListArea(helperContext, { areaSize: listAreaSize });
          }
        }
      }
    }
  };
};
