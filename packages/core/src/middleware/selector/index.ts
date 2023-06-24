import { calcElementsViewInfo, calcElementVertexesInGroup, calcElementQueueVertexesQueueInGroup, calcElementSizeController } from '@idraw/util';
import type { Point, PointWatcherEvent, BoardMiddleware, Element, ElementSize, ActionType, ResizeType, DeepSelectorSharedStorage, ElementType } from './types';
import { drawHoverVertexesWrapper, drawArea, drawListArea, drawGroupQueueVertexesWrappers, drawSelectedElementControllersVertexes } from './draw-wrapper';
import {
  getPointTarget,
  resizeElement,
  getSelectedListArea,
  calcSelectedElementsArea,
  isElementInGroup,
  isPointInViewActiveGroup,
  calcMoveInGroup
} from './util';
import {
  key,
  keyActionType,
  keyResizeType,
  keyAreaStart,
  keyAreaEnd,
  keyGroupQueue,
  keyGroupQueueVertexesList,
  keyHoverElement,
  keyHoverElementVertexes,
  keySelectedElementList,
  keySelectedElementListVertexes,
  keySelectedElementController
} from './config';
import { ViewRectVertexes } from '@idraw/types';

export const MiddlewareSelector: BoardMiddleware<DeepSelectorSharedStorage> = (opts) => {
  const { viewer, sharer, viewContent, calculator } = opts;
  const { helperContext } = viewContent;
  let prevPoint: Point | null = null;

  sharer.setSharedStorage(keyActionType, null);

  const getActiveElements = () => {
    return sharer.getSharedStorage(keySelectedElementList);
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
    const vertexesList = calcElementQueueVertexesQueueInGroup(groupQueue);
    sharer.setSharedStorage(keyGroupQueue, groupQueue);
    sharer.setSharedStorage(keyGroupQueueVertexesList, vertexesList);
    return groupQueue.length > 0;
  };

  const updateHoverElement = (elem: Element<ElementType> | null) => {
    sharer.setSharedStorage(keyHoverElement, elem);
    let vertexes: ViewRectVertexes | null = null;
    if (elem) {
      vertexes = calcElementVertexesInGroup(elem, {
        groupQueue: sharer.getSharedStorage(keyGroupQueue)
      });
    }
    sharer.setSharedStorage(keyHoverElementVertexes, vertexes);
  };

  const updateSelectedElementList = (list: Element<ElementType>[]) => {
    sharer.setSharedStorage(keySelectedElementList, list);
    if (list.length === 1) {
      const controller = calcElementSizeController(list[0], {
        groupQueue: sharer.getSharedStorage(keyGroupQueue),
        controllerSize: 10
      });
      sharer.setSharedStorage(keySelectedElementController, controller);
    } else {
      sharer.setSharedStorage(keySelectedElementController, null);
    }
  };

  const pointTargetBaseOptions = () => {
    return {
      ctx: helperContext,
      calculator,
      data: sharer.getActiveStorage('data'),
      selectedElements: getActiveElements(),
      viewScaleInfo: sharer.getActiveScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: sharer.getSharedStorage(keyGroupQueue),
      areaSize: null,
      selectedElementController: sharer.getSharedStorage(keySelectedElementController)
    };
  };

  const clear = () => {
    sharer.setSharedStorage(keyActionType, null);
    sharer.setSharedStorage(keyResizeType, null);
    sharer.setSharedStorage(keyAreaStart, null);
    sharer.setSharedStorage(keyAreaEnd, null);
    sharer.setSharedStorage(keyGroupQueue, []);
    sharer.setSharedStorage(keyGroupQueueVertexesList, []);
    sharer.setSharedStorage(keyHoverElement, null);
    sharer.setSharedStorage(keyHoverElementVertexes, null);
    sharer.setSharedStorage(keySelectedElementList, []);
    sharer.setSharedStorage(keySelectedElementListVertexes, null);
    sharer.setSharedStorage(keySelectedElementController, null);
  };

  clear();

  return {
    mode: key,
    hover: (e: PointWatcherEvent) => {
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        // in group
        const isInActiveGroup = isPointInViewActiveGroup(e.point, {
          ctx: helperContext,
          viewScaleInfo: sharer.getActiveScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
          groupQueue: sharer.getSharedStorage(keyGroupQueue)
        });
        if (!isInActiveGroup) {
          updateHoverElement(null);
          viewer.drawFrame();
          return;
        }
        const target = getPointTarget(e.point, pointTargetBaseOptions());
        if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
          updateHoverElement(null);
          viewer.drawFrame();
          return;
        }
        if (target?.elements?.length === 1) {
          updateHoverElement(target.elements[0]);
          viewer.drawFrame();
          return;
        }
        updateHoverElement(null);
        viewer.drawFrame();
        return;
      }

      // not in group
      if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
        updateHoverElement(null);
        return;
      }

      if (actionType === 'drag') {
        updateHoverElement(null);
        return;
      }

      const selectedElements = getActiveElements();
      const viewScaleInfo = sharer.getActiveScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(),
        areaSize: calcSelectedElementsArea(selectedElements, {
          viewScaleInfo,
          viewSizeInfo,
          calculator
        })
      });

      if (target.type === 'over-element' && target?.elements?.length === 1) {
        sharer.setSharedStorage(keyHoverElement, target.elements[0]);
        updateHoverElement(target.elements[0]);
        viewer.drawFrame();
        return;
      }

      if (sharer.getSharedStorage(keyHoverElement)) {
        updateHoverElement(null);
        viewer.drawFrame();
        return;
      }
    },

    pointStart: (e: PointWatcherEvent) => {
      prevPoint = e.point;

      updateHoverElement(null);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        if (
          isPointInViewActiveGroup(e.point, {
            ctx: helperContext,
            viewScaleInfo: sharer.getActiveScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            groupQueue
          })
        ) {
          const target = getPointTarget(e.point, pointTargetBaseOptions());
          updateHoverElement(null);
          if (target?.elements?.length === 1) {
            updateSelectedElementList([target.elements[0]]);
            sharer.setSharedStorage(keyActionType, 'drag');
          } else if (target.type?.startsWith('resize-')) {
            sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
            sharer.setSharedStorage(keyActionType, 'resize');
          } else {
            updateSelectedElementList([]);
          }
        } else {
          // TODO
          clear();
        }
        viewer.drawFrame();
        return;
      }

      // not in group
      const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
        viewScaleInfo: sharer.getActiveScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator
      });
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(),
        areaSize: listAreaSize,
        groupQueue: []
      });

      if (target.type === 'list-area') {
        sharer.setSharedStorage(keyActionType, 'drag-list');
      } else if (target.type === 'over-element' && target?.elements?.length === 1) {
        updateSelectedElementList([target.elements[0]]);
        sharer.setSharedStorage(keyActionType, 'drag');
      } else if (target.type?.startsWith('resize-')) {
        sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
        sharer.setSharedStorage(keyActionType, 'resize');
      } else {
        clear();
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
        updateSelectedElementList([]);
      }
      // if (target.type) {
      //   prevPoint = e.point;
      // } else {
      //   prevPoint = null;
      // }

      viewer.drawFrame();
    },

    pointMove: (e: PointWatcherEvent) => {
      const data = sharer.getActiveStorage('data');
      const elems = getActiveElements();
      const scale = sharer.getActiveStorage('scale') || 1;
      const start = prevPoint;
      const end = e.point;
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (actionType === 'drag') {
        if (data && elems?.length === 1 && start && end) {
          const { moveX, moveY } = calcMoveInGroup(start, end, groupQueue);
          elems[0].x += moveX / scale;
          elems[0].y += moveY / scale;
          updateSelectedElementList([elems[0]]);
        }
        viewer.drawFrame();
      } else if (actionType === 'drag-list') {
        if (data && start && end && elems?.length > 1) {
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          elems.forEach((elem: Element<ElementType>) => {
            if (elem) {
              elem.x += moveX;
              elem.y += moveY;
            }
          });
          sharer.setActiveStorage('data', data);
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (data && elems?.length === 1 && start && resizeType?.startsWith('resize-')) {
          const resizedElemSize = resizeElement(elems[0], { scale, start, end, resizeType });
          elems[0].x = resizedElemSize.x;
          elems[0].y = resizedElemSize.y;
          elems[0].w = resizedElemSize.w;
          elems[0].h = resizedElemSize.h;
          updateSelectedElementList([elems[0]]);
          viewer.drawFrame();
        }
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyAreaEnd, e.point);
        viewer.drawFrame();
      }
      prevPoint = e.point;
    },

    pointEnd(e: PointWatcherEvent) {
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const viewScaleInfo = sharer.getActiveScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const { offsetLeft, offsetTop } = viewScaleInfo;
      let needDrawFrame = false;
      prevPoint = null;
      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyActionType, null);
        if (data) {
          const start = sharer.getSharedStorage(keyAreaStart);
          const end = sharer.getSharedStorage(keyAreaEnd);
          if (start && end) {
            const { elements } = getSelectedListArea(data, {
              start,
              end,
              calculator,
              viewScaleInfo: sharer.getActiveScaleInfo(),
              viewSizeInfo: sharer.getActiveViewSizeInfo()
            });

            if (elements.length > 0) {
              sharer.setSharedStorage(keyActionType, 'drag-list');
              updateSelectedElementList(elements);
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
      prevPoint = null;
      clear();
      viewer.drawFrame();
    },

    doubleClick(e: PointWatcherEvent) {
      const target = getPointTarget(e.point, pointTargetBaseOptions());

      if (target.elements.length === 1 && target.elements[0]?.type === 'group') {
        const pushResult = pushGroupQueue(target.elements[0] as Element<'group'>);
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
      const { scale, offsetLeft, offsetTop, offsetRight, offsetBottom, width, height, contextX, contextY, contextHeight, contextWidth, devicePixelRatio } =
        activeStore;

      const viewScaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      const viewSizeInfo = { width, height, contextX, contextY, contextHeight, contextWidth, devicePixelRatio };
      const selectedElements = sharedStore[keySelectedElementList];
      const elem = selectedElements[0];
      const hoverElement: ElementSize = sharedStore[keyHoverElement] as ElementSize;
      const hoverElementVertexes: ViewRectVertexes | null = sharedStore[keyHoverElementVertexes];
      const actionType: ActionType = sharedStore[keyActionType] as ActionType;
      const areaStart: Point | null = sharedStore[keyAreaStart];
      const areaEnd: Point | null = sharedStore[keyAreaEnd];
      const groupQueue: Element<'group'>[] = sharedStore[keyGroupQueue];
      const groupQueueVertexesList: ViewRectVertexes[] = sharedStore[keyGroupQueueVertexesList];
      const drawBaseOpts = { calculator, viewScaleInfo, viewSizeInfo };
      const selectedElementController = sharedStore[keySelectedElementController];

      if (groupQueue?.length > 0) {
        // in group
        drawGroupQueueVertexesWrappers(helperContext, groupQueueVertexesList, drawBaseOpts);
        if (hoverElement && actionType !== 'drag') {
          drawHoverVertexesWrapper(helperContext, hoverElementVertexes, drawBaseOpts);
        }
        if (elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(helperContext, selectedElementController, { ...drawBaseOpts });
        }
      } else {
        // in root
        if (hoverElement && actionType !== 'drag') {
          drawHoverVertexesWrapper(helperContext, hoverElementVertexes, drawBaseOpts);
        }
        if (elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(helperContext, selectedElementController, { ...drawBaseOpts });
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
