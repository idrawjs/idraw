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
  deepResizeGroupElement
} from '@idraw/util';
import type { ViewRectVertexes, CoreEventMap, ElementPosition, ViewScaleInfo, ViewSizeInfo, ElementSizeController } from '@idraw/types';
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
  drawLockVertexesWrapper,
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
  keySelectedReferenceXLines,
  keySelectedReferenceYLines,
  keyIsMoving,
  keyEnableSelectInGroup,
  controllerSize
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

export { keySelectedElementList, keyActionType, keyResizeType, keyGroupQueue };
export type { DeepSelectorSharedStorage, ActionType };

export { middlewareEventSelect, middlewareEventSelectClear, middlewareEventSelectInGroup };

export const MiddlewareSelector: BoardMiddleware<DeepSelectorSharedStorage, CoreEventMap> = (opts) => {
  const { viewer, sharer, boardContent, calculator, eventHub } = opts;
  const { helperContext } = boardContent;
  let prevPoint: Point | null = null;
  let inBusyMode: 'resize' | 'drag' | 'drag-list' | 'area' | null = null;

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
      ctx: helperContext,
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
    sharer.setSharedStorage(keySelectedReferenceXLines, []);
    sharer.setSharedStorage(keySelectedReferenceYLines, []);
    sharer.setSharedStorage(keyIsMoving, null);
    sharer.setSharedStorage(keyEnableSelectInGroup, null);
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

  const selectInGroupCallback = (e: { enable: boolean }) => {
    sharer.setSharedStorage(keyEnableSelectInGroup, !!e.enable);
  };

  return {
    name: '@middleware/selector',
    use() {
      eventHub.on(middlewareEventSelect, selectCallback);
      eventHub.on(middlewareEventSelectClear, selectClearCallback);
      eventHub.on(middlewareEventSelectInGroup, selectInGroupCallback);
    },

    disuse() {
      eventHub.off(middlewareEventSelect, selectCallback);
      eventHub.off(middlewareEventSelectClear, selectClearCallback);
      eventHub.off(middlewareEventSelectInGroup, selectInGroupCallback);
    },

    hover: (e: PointWatcherEvent) => {
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);
      const triggerCursor = (target: PointTarget) => {
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
          ctx: helperContext,
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

      // updateHoverElement(null);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        if (
          isPointInViewActiveGroup(e.point, {
            ctx: helperContext,
            viewScaleInfo: sharer.getActiveViewScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            groupQueue
          })
        ) {
          const target = getPointTarget(e.point, pointTargetBaseOptions());
          if (target?.elements?.length === 1 && target.elements[0]?.operations?.lock === true) {
            return;
          } else {
            updateHoverElement(null);
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
      if (target?.elements?.length === 1 && target.elements[0]?.operations?.lock === true) {
        return;
      } else {
        updateHoverElement(null);
      }

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
      // if (target.type) {
      //   prevPoint = e.point;
      // } else {
      //   prevPoint = null;
      // }

      viewer.drawFrame();
    },

    pointMove: (e: PointWatcherEvent) => {
      sharer.setSharedStorage(keySelectedReferenceXLines, []);
      sharer.setSharedStorage(keySelectedReferenceYLines, []);
      sharer.setSharedStorage(keyIsMoving, true);
      const data = sharer.getActiveStorage('data');
      const elems = getActiveElements();
      const scale = sharer.getActiveStorage('scale') || 1;
      const viewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo() as unknown as ViewScaleInfo;
      const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo() as unknown as ViewSizeInfo;
      const start = prevPoint;
      const end = e.point;
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (actionType === 'drag') {
        inBusyMode = 'drag';
        if (data && elems?.length === 1 && start && end && elems[0]?.operations?.lock !== true) {
          const { moveX, moveY } = calcMoveInGroup(start, end, groupQueue);

          let totalMoveX = calculator.toGridNum(moveX / scale);
          let totalMoveY = calculator.toGridNum(moveY / scale);

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
              sharer.setSharedStorage(keySelectedReferenceXLines, referenceInfo.xLines);
              sharer.setSharedStorage(keySelectedReferenceYLines, referenceInfo.yLines);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
          }

          elems[0].x = calculator.toGridNum(elems[0].x + totalMoveX);
          elems[0].y = calculator.toGridNum(elems[0].y + totalMoveY);
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
        if (data && start && end && elems?.length > 1) {
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          elems.forEach((elem: Element<ElementType>) => {
            if (elem && elem?.operations?.lock !== true) {
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
          // calculator.updateVisiableStatus({
          //   viewSizeInfo,
          //   viewScaleInfo
          // });

          sharer.setActiveStorage('data', data);
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (data && elems?.length === 1 && start && resizeType?.startsWith('resize-')) {
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

          let resizeStart: PointSize = start;
          let resizeEnd: PointSize = end;

          if (groupQueue.length > 0) {
            resizeStart = rotatePointInGroup(start, pointGroupQueue);
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
            const resizedElemSize = rotateElement(elems[0], {
              center: viewCenter,
              viewScaleInfo,
              viewSizeInfo,
              start,
              end,
              resizeType,
              sharer
            });

            elems[0].angle = calculator.toGridNum(resizedElemSize.angle || 0);
          } else {
            const resizedElemSize = resizeElement(elems[0], { scale, start: resizeStart, end: resizeEnd, resizeType, sharer });
            const calcOpts = { ignore: !!elems[0].angle };
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

      // if (data && (['drag', 'drag-list', 'drag-list-end', 'resize'] as ActionType[]).includes(actionType)) {
      //   eventHub.trigger(eventChange, { data });
      // }
    },

    pointEnd(e: PointWatcherEvent) {
      inBusyMode = null;
      sharer.setSharedStorage(keySelectedReferenceXLines, []);
      sharer.setSharedStorage(keySelectedReferenceYLines, []);
      sharer.setSharedStorage(keyIsMoving, false);
      const data = sharer.getActiveStorage('data');
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      // const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      // const { offsetLeft, offsetTop } = viewScaleInfo;
      let needDrawFrame = false;
      prevPoint = null;
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
          eventHub.trigger(eventChange, { data, type });
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
      if (sharer.getSharedStorage(keyEnableSelectInGroup) === false) {
        return;
      }

      const target = getPointTarget(e.point, pointTargetBaseOptions());
      sharer.setSharedStorage(keySelectedElementController, null);
      sharer.setSharedStorage(keySelectedElementList, []);

      if (target.elements.length === 1 && target.elements[0]?.operations?.lock === true) {
        return;
      }

      if (target.elements.length === 1 && target.elements[0]?.type === 'group') {
        const pushResult = pushGroupQueue(target.elements[0] as Element<'group'>);
        if (pushResult === true) {
          sharer.setSharedStorage(keyActionType, null);
          viewer.drawFrame();
          return;
        }
      } else if (target.elements.length === 1 && target.elements[0]?.type === 'text') {
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

      const drawBaseOpts = { calculator, viewScaleInfo, viewSizeInfo };
      // const selectedElementController = sharedStore[keySelectedElementController];
      // const resizeType: ResizeType | null = sharedStore[keyResizeType];

      const selectedElementController = elem
        ? calcElementSizeController(elem, {
            groupQueue,
            controllerSize: 10,
            viewScaleInfo
          })
        : null;

      const isLock: boolean = !!hoverElement?.operations?.lock;

      if (groupQueue?.length > 0) {
        // in group
        drawGroupQueueVertexesWrappers(helperContext, groupQueueVertexesList, drawBaseOpts);
        if (hoverElement && actionType !== 'drag') {
          if (isLock) {
            drawLockVertexesWrapper(helperContext, hoverElementVertexes, {
              ...drawBaseOpts,
              controller: calcElementSizeController(hoverElement, {
                groupQueue,
                controllerSize: 10,
                viewScaleInfo
              })
            });
          } else {
            drawHoverVertexesWrapper(helperContext, hoverElementVertexes, drawBaseOpts);
          }
        }
        if (!isLock && elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(helperContext, selectedElementController, {
            ...drawBaseOpts,
            element: elem,
            calculator,
            hideControllers: !!isMoving && actionType === 'drag'
          });
          if (actionType === 'drag') {
            const xLines = sharer.getSharedStorage(keySelectedReferenceXLines);
            const yLines = sharer.getSharedStorage(keySelectedReferenceYLines);
            drawReferenceLines(helperContext, {
              xLines,
              yLines
            });
          }
        }
      } else {
        // in root
        if (hoverElement && actionType !== 'drag') {
          if (isLock) {
            drawLockVertexesWrapper(helperContext, hoverElementVertexes, {
              ...drawBaseOpts,
              controller: calcElementSizeController(hoverElement, {
                groupQueue,
                controllerSize: 10,
                viewScaleInfo
              })
            });
          } else {
            drawHoverVertexesWrapper(helperContext, hoverElementVertexes, drawBaseOpts);
          }
        }
        if (!isLock && elem && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
          drawSelectedElementControllersVertexes(helperContext, selectedElementController, {
            ...drawBaseOpts,
            element: elem,
            calculator,
            hideControllers: !!isMoving && actionType === 'drag'
          });
          if (actionType === 'drag') {
            const xLines = sharer.getSharedStorage(keySelectedReferenceXLines);
            const yLines = sharer.getSharedStorage(keySelectedReferenceYLines);
            drawReferenceLines(helperContext, {
              xLines,
              yLines
            });
          }
        } else if (actionType === 'area' && areaStart && areaEnd) {
          drawArea(helperContext, { start: areaStart, end: areaEnd });
        } else if ((['drag-list', 'drag-list-end'] as ActionType[]).includes(actionType)) {
          const listAreaSize = calcSelectedElementsArea(getActiveElements(), {
            viewScaleInfo: sharer.getActiveViewScaleInfo(),
            viewSizeInfo: sharer.getActiveViewSizeInfo(),
            calculator
          });
          if (listAreaSize) {
            drawListArea(helperContext, { areaSize: listAreaSize });
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
      //   helperContext.beginPath();
      //   helperContext.moveTo(elemCenter.x, elemCenter.y);
      //   helperContext.lineTo(end0.x, end0.y);
      //   helperContext.closePath();
      //   helperContext.strokeStyle = 'black';
      //   helperContext.stroke();
      // }
      // if (elemCenter && endVertical) {
      //   helperContext.beginPath();
      //   helperContext.moveTo(elemCenter.x, elemCenter.y);
      //   helperContext.lineTo(endVertical.x, endVertical.y);
      //   helperContext.closePath();
      //   helperContext.strokeStyle = 'red';
      //   helperContext.stroke();
      // }
      // if (elemCenter && endHorizontal) {
      //   helperContext.beginPath();
      //   helperContext.moveTo(elemCenter.x, elemCenter.y);
      //   helperContext.lineTo(endHorizontal.x, endHorizontal.y);
      //   helperContext.closePath();
      //   helperContext.strokeStyle = 'blue';
      //   helperContext.stroke();
      // }
    }
  };
};
