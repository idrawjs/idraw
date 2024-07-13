import {
  is,
  calcElementsViewInfo,
  calcElementVertexesInGroup,
  calcElementQueueVertexesQueueInGroup,
  calcElementSizeController,
  calcElementCenterFromVertexes,
  rotatePointInGroup,
  getGroupQueueFromList,
  findElementsFromList,
  findElementsFromListByPositions,
  getElementPositionFromList,
  deepResizeGroupElement,
  getElementSize
} from '@idraw/util';
import type {
  Data,
  ViewRectVertexes,
  CoreEventMap,
  ElementPosition,
  ViewScaleInfo,
  ViewSizeInfo,
  ElementSizeController,
  MiddlewareSelectorConfig,
  ElementSize
} from '@idraw/types';
import type {
  Point,
  PointSize,
  PointWatcherEvent,
  BoardMiddleware,
  Element,
  ActionType,
  ResizeType,
  DeepSelectorSharedStorage,
  ElementType,
  PointTarget
} from './types';
import {
  drawHoverVertexesWrapper,
  drawLockedVertexesWrapper,
  drawArea,
  drawListArea,
  drawGroupQueueVertexesWrappers,
  drawSelectedElementControllersVertexes
} from './draw-wrapper';
import { drawReferenceLines } from './draw-reference';
import {
  getPointTarget,
  resizeElement,
  rotateElement,
  getSelectedListArea,
  calcSelectedElementsArea,
  isElementInGroup,
  isPointInViewActiveGroup,
  calcMoveInGroup
} from './util';
import {
  middlewareEventSelect,
  middlewareEventSelectClear,
  middlewareEventSelectInGroup,
  middlewareEventSnapToGrid,
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
  keySelectedElementController,
  keySelectedElementPosition,
  keyIsMoving,
  keyEnableSelectInGroup,
  keyEnableSnapToGrid,
  controllerSize,
  defaultStyle
  // keyDebugElemCenter,
  // keyDebugEnd0,
  // keyDebugEndHorizontal,
  // keyDebugEndVertical,
  // keyDebugStartHorizontal,
  // keyDebugStartVertical
} from './config';
import { calcReferenceInfo } from './reference';
import { middlewareEventTextEdit } from '../text-editor';
import { eventChange } from '../../config';
import { keyLayoutIsSelected } from '../layout-selector';

export { keySelectedElementList, keyHoverElement, keyActionType, keyResizeType, keyGroupQueue };
export type { DeepSelectorSharedStorage, ActionType };

export { middlewareEventSelect, middlewareEventSelectClear, middlewareEventSelectInGroup, middlewareEventSnapToGrid };

export const MiddlewareSelector: BoardMiddleware<DeepSelectorSharedStorage, CoreEventMap, MiddlewareSelectorConfig> = (opts, config) => {
  const innerConfig = {
    ...defaultStyle,
    ...config
  };
  const { activeColor, activeAreaColor, lockedColor, referenceColor } = innerConfig;
  const style = { activeColor, activeAreaColor, lockedColor, referenceColor };
  const { viewer, sharer, boardContent, calculator, eventHub } = opts;
  const { overlayContext } = boardContent;
  let prevPoint: Point | null = null;
  let moveOriginalStartPoint: Point | null = null;
  let moveOriginalStartElementSize: ElementSize | null = null;
  let inBusyMode: 'resize' | 'drag' | 'drag-list' | 'area' | null = null;

  sharer.setSharedStorage(keyActionType, null);
  sharer.setSharedStorage(keyEnableSnapToGrid, true);

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

  const updateSelectedElementList = (list: Element<ElementType>[], opts?: { triggerEvent?: boolean }) => {
    sharer.setSharedStorage(keySelectedElementList, list);
    if (list.length === 1) {
      const controller = calcElementSizeController(list[0], {
        groupQueue: sharer.getSharedStorage(keyGroupQueue),
        controllerSize,
        viewScaleInfo: sharer.getActiveViewScaleInfo()
      });
      sharer.setSharedStorage(keySelectedElementController, controller);
      sharer.setSharedStorage(keySelectedElementPosition, getElementPositionFromList(list[0].uuid, sharer.getActiveStorage('data')?.elements || []));
    } else {
      sharer.setSharedStorage(keySelectedElementController, null);
      sharer.setSharedStorage(keySelectedElementPosition, []);
    }

    if (opts?.triggerEvent === true) {
      eventHub.trigger(middlewareEventSelect, { uuids: list.map((elem) => elem.uuid) });
    }
  };

  const pointTargetBaseOptions = () => {
    return {
      ctx: overlayContext,
      calculator,
      data: sharer.getActiveStorage('data'),
      selectedElements: getActiveElements(),
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: sharer.getSharedStorage(keyGroupQueue),
      areaSize: null,
      selectedElementController: sharer.getSharedStorage(keySelectedElementController),
      selectedElementPosition: sharer.getSharedStorage(keySelectedElementPosition)
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
    sharer.setSharedStorage(keySelectedElementPosition, []);
    sharer.setSharedStorage(keyIsMoving, null);
  };

  clear();

  const selectCallback = ({ uuids, positions }: { uuids: string[]; positions: ElementPosition[] }) => {
    let elements: Element[] = [];
    const actionType = sharer.getSharedStorage(keyActionType);
    const data = sharer.getActiveStorage('data');
    if (positions && Array.isArray(positions)) {
      elements = findElementsFromListByPositions(positions, data?.elements || []);
    } else {
      elements = findElementsFromList(uuids, data?.elements || []);
    }

    let needRefresh = false;
    if (!actionType && elements.length === 1) {
      // TODO
      sharer.setSharedStorage(keyActionType, 'select');
      needRefresh = true;
    } else if (actionType === 'select' && elements.length === 1) {
      // TODO
      needRefresh = true;
    }

    if (needRefresh) {
      const elem = elements[0];
      const groupQueue = getGroupQueueFromList(elem.uuid, data?.elements || []);
      sharer.setSharedStorage(keyGroupQueue, groupQueue);
      updateSelectedElementList(elements);
      viewer.drawFrame();
    }
  };

  const selectClearCallback = () => {
    clear();
    viewer.drawFrame();
  };

  const setSnapToSnapCallback = (e: { enable: boolean }) => {
    sharer.setSharedStorage(keyEnableSnapToGrid, !!e.enable);
  };

  const selectInGroupCallback = (e: { enable: boolean }) => {
    sharer.setSharedStorage(keyEnableSelectInGroup, !!e.enable);
  };

  return {
    name: '@middleware/selector',
    use() {
      eventHub.on(middlewareEventSelect, selectCallback);
      eventHub.on(middlewareEventSelectClear, selectClearCallback);
      eventHub.on(middlewareEventSelectInGroup, selectInGroupCallback);
      eventHub.on(middlewareEventSnapToGrid, setSnapToSnapCallback);
    },

    disuse() {
      eventHub.off(middlewareEventSelect, selectCallback);
      eventHub.off(middlewareEventSelectClear, selectClearCallback);
      eventHub.off(middlewareEventSelectInGroup, selectInGroupCallback);
      eventHub.off(middlewareEventSnapToGrid, setSnapToSnapCallback);
    },

    hover: (e: PointWatcherEvent) => {
      const layoutIsSelected = sharer.getSharedStorage(keyLayoutIsSelected);

      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);
      const triggerCursor = (target: PointTarget) => {
        if (layoutIsSelected === true) {
          return;
        }
        const cursor: string | null = target.type;
        if (inBusyMode === null) {
          eventHub.trigger('cursor', {
            type: cursor,
            groupQueue: target.groupQueue,
            element: target.elements[0]
          });
        }
      };

      if (groupQueue?.length > 0) {
        // in group
        const isInActiveGroup = isPointInViewActiveGroup(e.point, {
          ctx: overlayContext,
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
          groupQueue: sharer.getSharedStorage(keyGroupQueue)
        });
        if (!isInActiveGroup) {
          updateHoverElement(null);
          viewer.drawFrame();
          return;
        }
        const target = getPointTarget(e.point, pointTargetBaseOptions());
        triggerCursor(target);

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
      const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(),
        areaSize: calcSelectedElementsArea(selectedElements, {
          viewScaleInfo,
          viewSizeInfo,
          calculator
        })
      });
      triggerCursor(target);

      if (target.type === null) {
        if (sharer.getSharedStorage(keyHoverElement) || sharer.getSharedStorage(keyHoverElementVertexes)) {
          sharer.setSharedStorage(keyHoverElement, null);
          sharer.setSharedStorage(keyHoverElementVertexes, null);
          viewer.drawFrame();
        }
        return;
      }

      if (
        target.type === 'over-element' &&
        sharer.getSharedStorage(keyActionType) === 'select' &&
        target.elements.length === 1 &&
        target.elements[0].uuid === getActiveElements()?.[0]?.uuid
      ) {
        return;
      }

      if (
        target.type === 'over-element' &&
        sharer.getSharedStorage(keyActionType) === null &&
        target.elements.length === 1 &&
        target.elements[0].uuid === sharer.getSharedStorage(keyHoverElement)?.uuid
      ) {
        return;
      }

      if (target.type === 'over-element' && target?.elements?.length === 1) {
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
      moveOriginalStartPoint = e.point;

      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        if (
          isPointInViewActiveGroup(e.point, {
            ctx: overlayContext,
            viewScaleInfo: sharer.getActiveViewScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            groupQueue
          })
        ) {
          const target = getPointTarget(e.point, pointTargetBaseOptions());
          if (target?.elements?.length === 1 && target.elements[0]?.operations?.locked === true) {
            return;
          } else {
            updateHoverElement(null);
          }

          if (target?.elements?.length === 1) {
            moveOriginalStartElementSize = getElementSize(target?.elements[0]);
          }

          if (target.type === 'over-element' && target?.elements?.length === 1) {
            updateSelectedElementList([target.elements[0]], { triggerEvent: true });
            sharer.setSharedStorage(keyActionType, 'drag');
          } else if (target.type?.startsWith('resize-')) {
            sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
            sharer.setSharedStorage(keyActionType, 'resize');
          } else {
            updateSelectedElementList([], { triggerEvent: true });
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
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator
      });
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(),
        areaSize: listAreaSize,
        groupQueue: []
      });
      const isLockedElement = target?.elements?.length === 1 && target.elements[0]?.operations?.locked === true;
      if (!isLockedElement) {
        updateHoverElement(null);
      }

      if (target?.elements?.length === 1) {
        moveOriginalStartElementSize = getElementSize(target?.elements[0]);
      }

      if (!isLockedElement) {
        if (target.type === 'list-area') {
          sharer.setSharedStorage(keyActionType, 'drag-list');
        } else if (target.type === 'over-element' && target?.elements?.length === 1) {
          updateSelectedElementList([target.elements[0]], { triggerEvent: true });
          sharer.setSharedStorage(keyActionType, 'drag');
        } else if (target.type?.startsWith('resize-')) {
          sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
          sharer.setSharedStorage(keyActionType, 'resize');
        } else {
          clear();
          sharer.setSharedStorage(keyActionType, 'area');
          sharer.setSharedStorage(keyAreaStart, e.point);
          updateSelectedElementList([], { triggerEvent: true });
        }
      } else {
        clear();
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
        updateSelectedElementList([], { triggerEvent: true });
      }

      viewer.drawFrame();
    },

    pointMove: (e: PointWatcherEvent) => {
      sharer.setSharedStorage(keyIsMoving, true);
      const data = sharer.getActiveStorage('data');
      const elems = getActiveElements();
      const scale = sharer.getActiveStorage('scale') || 1;
      const viewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo() as unknown as ViewScaleInfo;
      const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo() as unknown as ViewSizeInfo;
      const start = prevPoint;
      const originalStart = moveOriginalStartPoint;
      const end = e.point;
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      const enableSnapToGrid = sharer.getSharedStorage(keyEnableSnapToGrid);

      if (actionType === 'drag') {
        inBusyMode = 'drag';
        if (data && elems?.length === 1 && moveOriginalStartElementSize && originalStart && end && elems[0]?.operations?.locked !== true) {
          const { moveX, moveY } = calcMoveInGroup(originalStart, end, groupQueue);

          let totalMoveX = calculator.toGridNum(moveX / scale);
          let totalMoveY = calculator.toGridNum(moveY / scale);

          if (enableSnapToGrid === true) {
            const referenceInfo = calcReferenceInfo(elems[0].uuid, {
              calculator,
              data,
              groupQueue,
              viewScaleInfo,
              viewSizeInfo
            });
            try {
              if (referenceInfo) {
                if (is.x(referenceInfo.offsetX) && referenceInfo.offsetX !== null) {
                  totalMoveX = calculator.toGridNum(totalMoveX + referenceInfo.offsetX);
                }
                if (is.y(referenceInfo.offsetY) && referenceInfo.offsetY !== null) {
                  totalMoveY = calculator.toGridNum(totalMoveY + referenceInfo.offsetY);
                }
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error(err);
            }
          }

          elems[0].x = calculator.toGridNum(moveOriginalStartElementSize.x + totalMoveX);
          elems[0].y = calculator.toGridNum(moveOriginalStartElementSize.y + totalMoveY);
          updateSelectedElementList([elems[0]]);
          calculator.modifyViewVisibleInfoMap(data, {
            modifyOptions: {
              type: 'updateElement',
              content: {
                element: elems[0],
                position: sharer.getSharedStorage(keySelectedElementPosition) || []
              }
            },
            viewSizeInfo,
            viewScaleInfo
          });
        }
        viewer.drawFrame();
      } else if (actionType === 'drag-list') {
        inBusyMode = 'drag-list';
        if (data && originalStart && start && end && elems?.length > 1) {
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          elems.forEach((elem: Element<ElementType>) => {
            if (elem && elem?.operations?.locked !== true) {
              elem.x = calculator.toGridNum(elem.x + moveX);
              elem.y = calculator.toGridNum(elem.y + moveY);

              calculator.modifyViewVisibleInfoMap(data, {
                modifyOptions: {
                  type: 'updateElement',
                  content: {
                    element: elem,
                    position: getElementPositionFromList(elem.uuid, data.elements) || []
                  }
                },
                viewSizeInfo,
                viewScaleInfo
              });
            }
          });

          sharer.setActiveStorage('data', data);
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (data && elems?.length === 1 && originalStart && moveOriginalStartElementSize && resizeType?.startsWith('resize-')) {
          inBusyMode = 'resize';
          const pointGroupQueue: Element<'group'>[] = [];
          groupQueue.forEach((group) => {
            const { x, y, w, h, angle = 0 } = group;
            pointGroupQueue.push({
              x,
              y,
              w,
              h,
              angle: 0 - angle
            } as Element<'group'>);
          });

          let resizeStart: PointSize = originalStart;
          let resizeEnd: PointSize = end;

          if (groupQueue.length > 0) {
            resizeStart = rotatePointInGroup(originalStart, pointGroupQueue);
            resizeEnd = rotatePointInGroup(end, pointGroupQueue);
          }
          if (resizeType === 'resize-rotate') {
            const controller: ElementSizeController = sharer.getSharedStorage(keySelectedElementController) as ElementSizeController;
            const viewVertexes: ViewRectVertexes = [
              controller.topLeft.center,
              controller.topRight.center,
              controller.bottomLeft.center,
              controller.bottomRight.center
            ];

            const viewCenter: PointSize = calcElementCenterFromVertexes(viewVertexes);
            const resizedElemSize = rotateElement(moveOriginalStartElementSize, {
              center: viewCenter,
              viewScaleInfo,
              viewSizeInfo,
              start: originalStart,
              end,
              resizeType,
              sharer
            });

            elems[0].angle = calculator.toGridNum(resizedElemSize.angle || 0);
          } else {
            const resizedElemSize = resizeElement(moveOriginalStartElementSize, { scale, start: resizeStart, end: resizeEnd, resizeType, sharer });
            const calcOpts = { ignore: !!moveOriginalStartElementSize.angle };
            elems[0].x = calculator.toGridNum(resizedElemSize.x, calcOpts);
            elems[0].y = calculator.toGridNum(resizedElemSize.y, calcOpts);
            if (elems[0].type === 'group' && elems[0].operations?.deepResize === true) {
              deepResizeGroupElement(elems[0] as Element<'group'>, {
                w: calculator.toGridNum(resizedElemSize.w, calcOpts),
                h: calculator.toGridNum(resizedElemSize.h, calcOpts)
              });
            } else {
              elems[0].w = calculator.toGridNum(resizedElemSize.w, calcOpts);
              elems[0].h = calculator.toGridNum(resizedElemSize.h, calcOpts);
            }
          }

          updateSelectedElementList([elems[0]]);
          calculator.modifyViewVisibleInfoMap(data, {
            modifyOptions: {
              type: 'updateElement',
              content: {
                element: elems[0],
                position: sharer.getSharedStorage(keySelectedElementPosition) || []
              }
            },
            viewSizeInfo,
            viewScaleInfo
          });
          viewer.drawFrame();
        }
      } else if (actionType === 'area') {
        inBusyMode = 'area';
        sharer.setSharedStorage(keyAreaEnd, e.point);
        viewer.drawFrame();
      }
      prevPoint = e.point;
    },

    pointEnd(e: PointWatcherEvent) {
      inBusyMode = null;
      sharer.setSharedStorage(keyIsMoving, false);
      const data = sharer.getActiveStorage('data');
      const selectedElements = sharer.getSharedStorage(keySelectedElementList);
      const hoverElement = sharer.getSharedStorage(keyHoverElement);
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      let needDrawFrame = false;

      prevPoint = null;
      moveOriginalStartPoint = null;
      moveOriginalStartElementSize = null;

      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
        needDrawFrame = true;
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
              viewScaleInfo: sharer.getActiveViewScaleInfo(),
              viewSizeInfo: sharer.getActiveViewSizeInfo()
            });

            if (elements.length > 0) {
              sharer.setSharedStorage(keyActionType, 'drag-list');
              updateSelectedElementList(elements, { triggerEvent: true });
              needDrawFrame = true;
            }
          }
        }
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyActionType, 'drag-list-end');
        needDrawFrame = true;
      } else if (data) {
        const result = calculator.getPointElement(e.point, {
          data,
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo()
        });
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
          sharer.setActiveStorage('contextHeight', viewInfo.contextSize.contextHeight);
          sharer.setActiveStorage('contextWidth', viewInfo.contextSize.contextWidth);
        }

        if (data && (['drag', 'drag-list', 'drag-list-end', 'resize'] as ActionType[]).includes(actionType)) {
          let type = 'dragElement';
          if (type === 'resize') {
            type = 'resizeElement';
          }
          eventHub.trigger(eventChange, { data, type, selectedElements, hoverElement });
        }
        viewer.drawFrame();
      };

      finalDrawFrame();
    },

    pointLeave() {
      prevPoint = null;
      moveOriginalStartPoint = null;
      moveOriginalStartElementSize = null;
      clear();
      viewer.drawFrame();
    },

    doubleClick(e: PointWatcherEvent) {
      if (sharer.getSharedStorage(keyEnableSelectInGroup) === false) {
        return;
      }

      const target = getPointTarget(e.point, pointTargetBaseOptions());
      sharer.setSharedStorage(keySelectedElementController, null);
      sharer.setSharedStorage(keySelectedElementList, []);

      if (target.elements.length === 1 && target.elements[0]?.operations?.locked === true) {
        return;
      }

      if (target.elements.length === 1 && target.elements[0]?.type === 'group') {
        const pushResult = pushGroupQueue(target.elements[0] as Element<'group'>);
        if (pushResult === true) {
          sharer.setSharedStorage(keyActionType, null);
          viewer.drawFrame();
          return;
        }
      } else if (target.elements.length === 1 && target.elements[0]?.type === 'text' && !target.elements[0]?.operations?.invisible) {
        eventHub.trigger(middlewareEventTextEdit, {
          element: target.elements[0],
          groupQueue: sharer.getSharedStorage(keyGroupQueue) || [],
          position: getElementPositionFromList(target.elements[0]?.uuid, sharer.getActiveStorage('data')?.elements || []),
          viewScaleInfo: sharer.getActiveViewScaleInfo()
        });
      }
      sharer.setSharedStorage(keyActionType, null);
    },

    beforeDrawFrame({ snapshot }) {
      const { activeStore, sharedStore } = snapshot;
      const { scale, offsetLeft, offsetTop, offsetRight, offsetBottom, width, height, contextHeight, contextWidth, devicePixelRatio } = activeStore;

      const sharer = opts.sharer;
      const viewScaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
      const viewSizeInfo = { width, height, contextHeight, contextWidth, devicePixelRatio };
      const selectedElements = sharedStore[keySelectedElementList];
      const elem = selectedElements[0];
      const hoverElement: Element = sharedStore[keyHoverElement] as Element;
      const hoverElementVertexes: ViewRectVertexes | null = sharedStore[keyHoverElementVertexes];
      const actionType: ActionType = sharedStore[keyActionType] as ActionType;
      const areaStart: Point | null = sharedStore[keyAreaStart];
      const areaEnd: Point | null = sharedStore[keyAreaEnd];
      const groupQueue: Element<'group'>[] = sharedStore[keyGroupQueue];
      const groupQueueVertexesList: ViewRectVertexes[] = sharedStore[keyGroupQueueVertexesList];
      const isMoving = sharedStore[keyIsMoving];
      const enableSnapToGrid = sharedStore[keyEnableSnapToGrid];

      const drawBaseOpts = { calculator, viewScaleInfo, viewSizeInfo, style };
      // const selectedElementController = sharedStore[keySelectedElementController];
      // const resizeType: ResizeType | null = sharedStore[keyResizeType];

      const selectedElementController = elem
        ? calcElementSizeController(elem, {
            groupQueue,
            controllerSize: 10,
            viewScaleInfo
          })
        : null;

      const isLocked: boolean = !!hoverElement?.operations?.locked;

      if (groupQueue?.length > 0) {
        // in group
        drawGroupQueueVertexesWrappers(overlayContext, groupQueueVertexesList, drawBaseOpts);
        if (hoverElement && actionType !== 'drag') {
          if (isLocked) {
            drawLockedVertexesWrapper(overlayContext, hoverElementVertexes, {
              ...drawBaseOpts,
              controller: calcElementSizeController(hoverElement, {
                groupQueue,
                controllerSize: 10,
                viewScaleInfo
              }),
              style
            });
          } else {
            drawHoverVertexesWrapper(overlayContext, hoverElementVertexes, drawBaseOpts);
          }
        }
        if (!isLocked && elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(overlayContext, selectedElementController, {
            ...drawBaseOpts,
            element: elem,
            calculator,
            hideControllers: !!isMoving && actionType === 'drag',
            style
          });
          if (actionType === 'drag') {
            if (enableSnapToGrid === true) {
              const referenceInfo = calcReferenceInfo(elem.uuid, {
                calculator,
                data: activeStore.data as Data,
                groupQueue,
                viewScaleInfo,
                viewSizeInfo
              });
              if (referenceInfo) {
                const { offsetX, offsetY, xLines, yLines } = referenceInfo;
                if (offsetX === 0 || offsetY === 0) {
                  drawReferenceLines(overlayContext, {
                    xLines,
                    yLines,
                    style
                  });
                }
              }
            }
          }
        }
      } else {
        // in root
        if (hoverElement && actionType !== 'drag') {
          if (isLocked) {
            drawLockedVertexesWrapper(overlayContext, hoverElementVertexes, {
              ...drawBaseOpts,
              controller: calcElementSizeController(hoverElement, {
                groupQueue,
                controllerSize: 10,
                viewScaleInfo
              }),
              style
            });
          } else {
            drawHoverVertexesWrapper(overlayContext, hoverElementVertexes, drawBaseOpts);
          }
        }
        if (!isLocked && elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(overlayContext, selectedElementController, {
            ...drawBaseOpts,
            element: elem,
            calculator,
            hideControllers: !!isMoving && actionType === 'drag',
            style
          });
          if (actionType === 'drag') {
            if (enableSnapToGrid === true) {
              const referenceInfo = calcReferenceInfo(elem.uuid, {
                calculator,
                data: activeStore.data as Data,
                groupQueue,
                viewScaleInfo,
                viewSizeInfo
              });
              if (referenceInfo) {
                const { offsetX, offsetY, xLines, yLines } = referenceInfo;
                if (offsetX === 0 || offsetY === 0) {
                  drawReferenceLines(overlayContext, {
                    xLines,
                    yLines,
                    style
                  });
                }
              }
            }
          }
        } else if (actionType === 'area' && areaStart && areaEnd) {
          drawArea(overlayContext, { start: areaStart, end: areaEnd, style });
        } else if ((['drag-list', 'drag-list-end'] as ActionType[]).includes(actionType)) {
          const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
            viewScaleInfo: sharer.getActiveViewScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            calculator
          });
          if (listAreaSize) {
            drawListArea(overlayContext, { areaSize: listAreaSize, style });
          }
        }
      }

      // // TODO mock data
      // const elemCenter: any = sharer.getSharedStorage(keyDebugElemCenter);
      // const startVertical = sharer.getSharedStorage(keyDebugStartVertical);
      // const endVertical: any = sharer.getSharedStorage(keyDebugEndVertical);
      // const startHorizontal = sharer.getSharedStorage(keyDebugStartHorizontal);
      // const endHorizontal: any = sharer.getSharedStorage(keyDebugEndHorizontal);
      // const end0: any = sharer.getSharedStorage(keyDebugEnd0);
      // if (elemCenter && end0) {
      //   overlayContext.originalStartPath();
      //   overlayContext.moveTo(elemCenter.x, elemCenter.y);
      //   overlayContext.lineTo(end0.x, end0.y);
      //   overlayContext.closePath();
      //   overlayContext.strokeStyle = 'black';
      //   overlayContext.stroke();
      // }
      // if (elemCenter && endVertical) {
      //   overlayContext.originalStartPath();
      //   overlayContext.moveTo(elemCenter.x, elemCenter.y);
      //   overlayContext.lineTo(endVertical.x, endVertical.y);
      //   overlayContext.closePath();
      //   overlayContext.strokeStyle = 'red';
      //   overlayContext.stroke();
      // }
      // if (elemCenter && endHorizontal) {
      //   overlayContext.originalStartPath();
      //   overlayContext.moveTo(elemCenter.x, elemCenter.y);
      //   overlayContext.lineTo(endHorizontal.x, endHorizontal.y);
      //   overlayContext.closePath();
      //   overlayContext.strokeStyle = 'blue';
      //   overlayContext.stroke();
      // }
    }
  };
};
