import {
  is,
  calcMaterialsViewInfo,
  rotatePointInGroup,
  getGroupQueueFromList,
  findMaterialsFromList,
  findMaterialsFromListByPositions,
  getMaterialPositionFromList,
  getMaterialPositionMapFromList,
  resizeEffectGroupMaterial,
  getMaterialSize,
  calcPointMoveMaterialInGroup,
  toFlattenMaterial,
  isPointInMiddlewareElement,
} from '@idraw/util';
import type {
  CoreEventMap,
  ViewScaleInfo,
  ViewSizeInfo,
  MiddlewareSelectorConfig,
  MaterialSize,
  StrictMaterial,
  ModifyRecord,
  Material,
  ModifyType,
} from '@idraw/types';
import type {
  Point,
  PointWatcherEvent,
  Middleware,
  ActionType,
  ResizeType,
  DeepSelectorSharedStorage,
  PointTarget,
} from './types';
import {
  getPointTarget,
  resizeMaterial,
  rotateMaterial,
  getSelectedListArea,
  calcSelectedMaterialsArea,
  isMaterialInGroup,
} from './util';
import {
  keyPrevPoint,
  keyPointStartMaterialSizeList,
  keyMoveOriginalStartPoint,
  keyMoveOriginalStartMaterialSize,
  keyInBusyMode,
  keyHasChangedData,
  keyStartResizeGroupRecord,
  keyEndResizeGroupRecord,

  // legacy
  keyActionType,
  keyResizeType,
  keyAreaStart,
  keyAreaEnd,
  keyGroupQueue,
  keyHoverMaterial,
  keySelectedMaterialList,
  keySelectedMaterialPosition,
  keyIsMoving,
  keyEnableSelectInGroup,
  keyEnableSnapToGrid,
  defaultStyle,
  clearStorage,
} from './static';
import { calcReferenceInfo } from './reference';
import { coreEventKeys } from '../../static';
import { keyLayoutIsSelected, keyLayoutIsBusyMoving } from '../layout-selector';
import { MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE } from '../info';
import { getRootClassName } from './static';
import { initRoot, isPointInActiveGroup } from './dom';
import { initStyles, destroyStyles, getMiddlewareSelectorStyles } from './styles';
import { dragAndResizeMaterial } from './resize';
import { renderFrame } from './render-frame';
import { triggerChangeEvent } from '../common';

export { keySelectedMaterialList, keyHoverMaterial, keyActionType, keyResizeType, keyGroupQueue };
export type { DeepSelectorSharedStorage, ActionType };

export { getMiddlewareSelectorStyles };

export const MiddlewareSelector: Middleware<
  DeepSelectorSharedStorage,
  CoreEventMap & {
    [MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE]: { show: boolean };
  },
  MiddlewareSelectorConfig
> = (opts, config) => {
  let innerConfig = {
    ...defaultStyle,
    ...config,
  };
  const styles = getMiddlewareSelectorStyles(innerConfig);

  const rootClassName = getRootClassName();
  let $root: HTMLDivElement | null = null;

  const { viewer, sharer, boardContent, calculator, eventHub } = opts;
  const { overlayContext } = boardContent;

  sharer.setSharedStorage(keyActionType, null);
  sharer.setSharedStorage(keyEnableSnapToGrid, true);

  const pushGroupQueue = (mtrl: Material) => {
    let groupQueue = sharer.getSharedStorage(keyGroupQueue);
    if (!Array.isArray(groupQueue)) {
      groupQueue = [];
    }
    if (groupQueue.length > 0) {
      if (isMaterialInGroup(mtrl, groupQueue[groupQueue.length - 1])) {
        groupQueue.push(mtrl as StrictMaterial<'group'>);
      } else {
        groupQueue = [];
      }
    } else if (groupQueue.length === 0) {
      groupQueue.push(mtrl as StrictMaterial<'group'>);
    }
    sharer.setSharedStorage(keyGroupQueue, groupQueue);
    return groupQueue.length > 0;
  };

  const updateSelectedMaterialList = (list: Material[], opts?: { triggerEvent?: boolean }) => {
    sharer.setSharedStorage(keySelectedMaterialList, list);
    if (list.length === 1) {
      sharer.setSharedStorage(
        keySelectedMaterialPosition,
        getMaterialPositionFromList(list[0].id, sharer.getActiveStorage('data')?.materials || [])
      );
    } else {
      sharer.setSharedStorage(keySelectedMaterialPosition, []);
    }

    if (opts?.triggerEvent === true) {
      const ids = list.map((mtrl) => mtrl.id);
      const data = sharer.getActiveStorage('data');
      const positionMap = getMaterialPositionMapFromList(ids, data?.materials || []);
      eventHub.trigger(coreEventKeys.SELECT, {
        type: 'clickCanvas',
        ids,
        positions: list.map((mtrl) => [...positionMap[mtrl.id]]),
      });
    }
  };

  const pointTargetBaseOptions = (pwe: PointWatcherEvent) => {
    return {
      ctx: overlayContext,
      calculator,
      data: sharer.getActiveStorage('data'),
      selectedMaterials: sharer.getSharedStorage(keySelectedMaterialList),
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: sharer.getSharedStorage(keyGroupQueue),
      areaSize: null,
      selectedMaterialPosition: sharer.getSharedStorage(keySelectedMaterialPosition),
      nativeEvent: pwe.nativeEvent,
    };
  };

  const clear = () => clearStorage(sharer);

  clear();

  const selectCallback = ({ ids = [], positions }: CoreEventMap[typeof coreEventKeys.SELECT]) => {
    let materials: Material[] = [];
    const actionType = sharer.getSharedStorage(keyActionType);
    const data = sharer.getActiveStorage('data');
    if (positions && Array.isArray(positions)) {
      materials = findMaterialsFromListByPositions(positions, data?.materials || []);
    } else {
      materials = findMaterialsFromList(ids, data?.materials || []);
    }

    let needRefresh = false;
    if (!actionType && materials.length === 1) {
      sharer.setSharedStorage(keyActionType, 'select');
      needRefresh = true;
    } else if (actionType === 'select' && materials.length === 1) {
      needRefresh = true;
    }

    if (needRefresh) {
      const mtrl = materials[0];
      const groupQueue = getGroupQueueFromList(mtrl.id, data?.materials || []);
      sharer.setSharedStorage(keyGroupQueue, groupQueue);
      updateSelectedMaterialList(materials);

      sharer.setSharedStorage(keyPointStartMaterialSizeList, [
        { ...getMaterialSize(materials[0]), id: materials[0].id },
      ]);
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
      initStyles(rootClassName, styles);
      $root = initRoot({ rootClassName, $container: opts.container as HTMLElement });

      eventHub.on(coreEventKeys.SELECT, selectCallback);
      eventHub.on(coreEventKeys.CLEAR_SELECT, selectClearCallback);
      eventHub.on(coreEventKeys.SELECT_IN_GROUP, selectInGroupCallback);
      eventHub.on(coreEventKeys.SNAP_TO_GRID, setSnapToSnapCallback);
    },

    disuse() {
      destroyStyles(rootClassName);
      eventHub.off(coreEventKeys.SELECT, selectCallback);
      eventHub.off(coreEventKeys.CLEAR_SELECT, selectClearCallback);
      eventHub.off(coreEventKeys.SELECT_IN_GROUP, selectInGroupCallback);
      eventHub.off(coreEventKeys.SNAP_TO_GRID, setSnapToSnapCallback);

      // clear dom
      $root?.remove();

      // clear data
      clear();
      innerConfig = null as any;
      $root = null;
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    hover: (e: PointWatcherEvent) => {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        if (sharer.getSharedStorage(keyHoverMaterial)) {
          sharer.setSharedStorage(keyHoverMaterial, null);
          viewer.drawFrame();
        }
        return;
      }
      const layoutIsSelected = sharer.getSharedStorage(keyLayoutIsSelected);
      const layoutIsBusyMoving = sharer.getSharedStorage(keyLayoutIsBusyMoving);
      if (layoutIsBusyMoving === true) {
        return;
      }

      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      const triggerCursor = (target: PointTarget) => {
        if (layoutIsSelected === true) {
          return;
        }
        const cursor: string | null = target.type;
        if (sharer.getSharedStorage(keyInBusyMode) === null) {
          eventHub.trigger(coreEventKeys.CURSOR, {
            type: cursor,
            groupQueue: target.groupQueue,
            material: target.materials[0],
          });
        }
      };

      if (groupQueue?.length > 0) {
        // in group
        const isInActiveGroup = isPointInActiveGroup(e.nativeEvent, {
          $root,
          groupQueue: sharer.getSharedStorage(keyGroupQueue),
        });
        if (!isInActiveGroup) {
          sharer.setSharedStorage(keyHoverMaterial, null);
          viewer.drawFrame();
          return;
        }
        const target = getPointTarget(e.point, pointTargetBaseOptions(e));
        triggerCursor(target);

        if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
          sharer.setSharedStorage(keyHoverMaterial, null);
          viewer.drawFrame();
          return;
        }
        if (target?.materials?.length === 1) {
          sharer.setSharedStorage(keyHoverMaterial, target.materials[0]);
          viewer.drawFrame();
          return;
        }
        sharer.setSharedStorage(keyHoverMaterial, null);
        viewer.drawFrame();
        return;
      }

      // not in group
      if (resizeType || (['area', 'drag', 'drag-list'] as ActionType[]).includes(actionType)) {
        sharer.setSharedStorage(keyHoverMaterial, null);
        return;
      }

      if (actionType === 'drag') {
        sharer.setSharedStorage(keyHoverMaterial, null);
        return;
      }

      const selectedMaterials = sharer.getSharedStorage(keySelectedMaterialList);
      const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(e),
        areaSize: calcSelectedMaterialsArea(selectedMaterials, {
          viewScaleInfo,
          viewSizeInfo,
          calculator,
        }),
      });

      triggerCursor(target);

      if (target.type === null) {
        if (sharer.getSharedStorage(keyHoverMaterial)) {
          sharer.setSharedStorage(keyHoverMaterial, null);
          viewer.drawFrame();
        }
        return;
      }

      if (
        target.type === 'over-material' &&
        sharer.getSharedStorage(keyActionType) === 'select' &&
        target.materials.length === 1 &&
        target.materials[0].id === sharer.getSharedStorage(keySelectedMaterialList)?.[0]?.id
      ) {
        return;
      }

      if (
        target.type === 'over-material' &&
        sharer.getSharedStorage(keyActionType) === null &&
        target.materials.length === 1 &&
        target.materials[0].id === sharer.getSharedStorage(keyHoverMaterial)?.id
      ) {
        return;
      }

      if (target.type === 'over-material' && target?.materials?.length === 1) {
        sharer.setSharedStorage(keyHoverMaterial, target.materials[0]);
        viewer.drawFrame();
        return;
      }

      if (sharer.getSharedStorage(keyHoverMaterial)) {
        sharer.setSharedStorage(keyHoverMaterial, null);
        viewer.drawFrame();
        return;
      }
    },

    pointStart: (e: PointWatcherEvent) => {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        return;
      }
      sharer.setSharedStorage(keyPrevPoint, e.point);
      sharer.setSharedStorage(keyMoveOriginalStartPoint, e.point);
      sharer.setSharedStorage(keyStartResizeGroupRecord, null);
      sharer.setSharedStorage(keyEndResizeGroupRecord, null);

      sharer.setSharedStorage(keyActionType, null);
      sharer.setSharedStorage(keyResizeType, null);
      sharer.setSharedStorage(keyAreaStart, null);
      sharer.setSharedStorage(keyAreaEnd, null);
      sharer.setSharedStorage(keyHoverMaterial, null);

      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        if (isPointInActiveGroup(e.nativeEvent, { $root, groupQueue })) {
          const target = getPointTarget(e.point, pointTargetBaseOptions(e));
          const isLockedMaterial = target?.materials?.length === 1 && target.materials[0]?.operations?.locked === true;

          sharer.setSharedStorage(keyHoverMaterial, null);

          if (target?.materials?.length === 1) {
            sharer.setSharedStorage(keyMoveOriginalStartMaterialSize, getMaterialSize(target?.materials[0]));
          }
          if (isLockedMaterial === true) {
            clear();
          } else if (target.type === 'over-material' && target?.materials?.length === 1) {
            updateSelectedMaterialList([target.materials[0]], { triggerEvent: true });
            sharer.setSharedStorage(keyActionType, 'drag');

            sharer.setSharedStorage(keyPointStartMaterialSizeList, [
              { ...getMaterialSize(target?.materials[0]), id: target?.materials[0].id },
            ]);
          } else if (target.type?.startsWith('resize-')) {
            sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
            sharer.setSharedStorage(keyActionType, 'resize');
          } else {
            updateSelectedMaterialList([], { triggerEvent: true });
          }
        } else {
          // TODO
          clear();
        }
        viewer.drawFrame();
        return;
      }

      // not in group
      const listAreaSize = calcSelectedMaterialsArea(sharer.getSharedStorage(keySelectedMaterialList), {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator,
      });
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(e),
        areaSize: listAreaSize,
        groupQueue: [],
      });

      const isLockedMaterial = target?.materials?.length === 1 && target.materials[0]?.operations?.locked === true;
      sharer.setSharedStorage(keyHoverMaterial, null);

      if (target?.materials?.length === 1) {
        sharer.setSharedStorage(keyMoveOriginalStartMaterialSize, getMaterialSize(target?.materials[0]));
      }

      if (isLockedMaterial === true) {
        clear();
        sharer.setSharedStorage(keyHoverMaterial, target?.materials[0]);
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
        updateSelectedMaterialList([], { triggerEvent: true });
      } else if (target.type === 'list-area') {
        sharer.setSharedStorage(keyActionType, 'drag-list');
      } else if (target.type === 'over-material' && target?.materials?.length === 1) {
        updateSelectedMaterialList([target.materials[0]], { triggerEvent: true });
        sharer.setSharedStorage(keyActionType, 'drag');

        sharer.setSharedStorage(keyPointStartMaterialSizeList, [
          { ...getMaterialSize(target?.materials[0]), id: target?.materials[0].id },
        ]);
      } else if (target.type?.startsWith('resize-')) {
        sharer.setSharedStorage(keyResizeType, target.type as ResizeType);
        sharer.setSharedStorage(keyActionType, 'resize');
      } else {
        clear();
        sharer.setSharedStorage(keyActionType, 'area');
        sharer.setSharedStorage(keyAreaStart, e.point);
        updateSelectedMaterialList([], { triggerEvent: true });
      }

      viewer.drawFrame();
    },

    pointMove: (e: PointWatcherEvent) => {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        return;
      }
      sharer.setSharedStorage(keyIsMoving, true);
      const data = sharer.getActiveStorage('data');
      const mtrls = sharer.getSharedStorage(keySelectedMaterialList);
      const scale = sharer.getActiveStorage('scale') || 1;
      const viewScaleInfo: ViewScaleInfo = sharer.getActiveViewScaleInfo() as unknown as ViewScaleInfo;
      const viewSizeInfo: ViewSizeInfo = sharer.getActiveViewSizeInfo() as unknown as ViewSizeInfo;

      const start = sharer.getSharedStorage(keyPrevPoint);
      const originalStart = sharer.getSharedStorage(keyMoveOriginalStartPoint);

      const end = e.point;
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      const enableSnapToGrid = sharer.getSharedStorage(keyEnableSnapToGrid);
      let modifyType: ModifyType = 'unknown';

      if (actionType === 'drag') {
        sharer.setSharedStorage(keyHasChangedData, true);
        sharer.setSharedStorage(keyInBusyMode, 'drag');

        eventHub.trigger(MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE, { show: false });

        if (
          data &&
          mtrls?.length === 1 &&
          sharer.getSharedStorage(keyMoveOriginalStartMaterialSize) &&
          originalStart &&
          end &&
          mtrls[0]?.operations?.locked !== true
        ) {
          const { moveX, moveY } = calcPointMoveMaterialInGroup(originalStart, end, groupQueue);

          let totalMoveX = calculator.toGridNum(moveX / scale);
          let totalMoveY = calculator.toGridNum(moveY / scale);

          if (enableSnapToGrid === true) {
            const referenceInfo = calcReferenceInfo(mtrls[0].id, {
              calculator,
              data,
              groupQueue,
              viewScaleInfo,
              viewSizeInfo,
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
          const moveOriginalStartMaterialSize = sharer.getSharedStorage(keyMoveOriginalStartMaterialSize) as Point;
          const newX = calculator.toGridNum(moveOriginalStartMaterialSize.x + totalMoveX);
          const newY = calculator.toGridNum(moveOriginalStartMaterialSize.y + totalMoveY);

          dragAndResizeMaterial(mtrls[0], {
            x: newX,
            y: newY,
            width: mtrls[0].width,
            height: mtrls[0].height,
          });

          updateSelectedMaterialList([mtrls[0]]);
          modifyType = 'updateMaterial';
          calculator.modifyVirtualItemMap(data, {
            modifyInfo: {
              type: modifyType,
              content: {
                material: mtrls[0],
                position: sharer.getSharedStorage(keySelectedMaterialPosition) || [],
              },
            },
            viewSizeInfo,
            viewScaleInfo,
          });
        }
        viewer.drawFrame();
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyHasChangedData, true);
        sharer.setSharedStorage(keyInBusyMode, 'drag-list');

        if (data && originalStart && start && end && mtrls?.length > 1) {
          const moveX = (end.x - start.x) / scale;
          const moveY = (end.y - start.y) / scale;
          mtrls.forEach((mtrl: Material) => {
            if (mtrl && mtrl?.operations?.locked !== true) {
              mtrl.x = calculator.toGridNum(mtrl.x + moveX);
              mtrl.y = calculator.toGridNum(mtrl.y + moveY);
              modifyType = 'updateMaterial';
              calculator.modifyVirtualItemMap(data, {
                modifyInfo: {
                  type: modifyType,
                  content: {
                    material: mtrl,
                    position: getMaterialPositionFromList(mtrl.id, data.materials) || [],
                  },
                },
                viewSizeInfo,
                viewScaleInfo,
              });
            }
          });

          sharer.setActiveStorage('data', data);
        }
        viewer.drawFrame();
      } else if (actionType === 'resize') {
        if (
          data &&
          mtrls?.length === 1 &&
          originalStart &&
          sharer.getSharedStorage(keyMoveOriginalStartMaterialSize) &&
          resizeType?.startsWith('resize-')
        ) {
          sharer.setSharedStorage(keyHasChangedData, true);
          sharer.setSharedStorage(keyInBusyMode, 'resize');

          const pointGroupQueue: StrictMaterial<'group'>[] = [];
          groupQueue.forEach((group) => {
            const { x, y, width, height, angle = 0 } = group;
            pointGroupQueue.push({
              x,
              y,
              width,
              height,
              angle: 0 - angle,
            } as StrictMaterial<'group'>);
          });

          let resizeStart: Point = originalStart;
          let resizeEnd: Point = end;

          if (groupQueue.length > 0) {
            resizeStart = rotatePointInGroup(originalStart, pointGroupQueue);
            resizeEnd = rotatePointInGroup(end, pointGroupQueue);
          }
          if (resizeType === 'resize-rotate') {
            const moveOriginalStartMaterialSize = sharer.getSharedStorage(
              keyMoveOriginalStartMaterialSize
            ) as MaterialSize;

            const virtualItem = calculator.getVirtualItem(mtrls?.[0]?.id as string);
            const worldCenter = virtualItem?.worldCenter as Point;

            const resizedMtrlSize = rotateMaterial(moveOriginalStartMaterialSize, {
              center: worldCenter,
              viewScaleInfo,
              viewSizeInfo,
              start: originalStart,
              end,
              resizeType,
              sharer,
              calculator,
            });

            mtrls[0].angle = calculator.toGridNum(resizedMtrlSize.angle || 0);
          } else {
            const moveOriginalStartMaterialSize = sharer.getSharedStorage(
              keyMoveOriginalStartMaterialSize
            ) as MaterialSize;
            const resizedMtrlSize = resizeMaterial(
              { ...moveOriginalStartMaterialSize, operations: mtrls[0].operations },
              { scale, start: resizeStart, end: resizeEnd, resizeType, sharer, calculator }
            );
            const calcOpts = { ignore: !!moveOriginalStartMaterialSize.angle };
            const gridX = calculator.toGridNum(resizedMtrlSize.x, calcOpts);
            const gridY = calculator.toGridNum(resizedMtrlSize.y, calcOpts);
            const gridW = calculator.toGridNum(resizedMtrlSize.width, calcOpts);
            const gridH = calculator.toGridNum(resizedMtrlSize.height, calcOpts);
            if (mtrls[0].type === 'group') {
              sharer.setSharedStorage(
                keyEndResizeGroupRecord,
                resizeEffectGroupMaterial(
                  mtrls[0] as StrictMaterial<'group'>,
                  {
                    x: gridX,
                    y: gridY,
                    width: gridW,
                    height: gridH,
                  },
                  { resizeEffect: mtrls[0].operations?.resizeEffect }
                )
              );
              if (!sharer.getSharedStorage(keyStartResizeGroupRecord)) {
                sharer.setSharedStorage(keyStartResizeGroupRecord, sharer.getSharedStorage(keyEndResizeGroupRecord));
              }
              mtrls[0].x = gridX;
              mtrls[0].y = gridY;
            } else {
              dragAndResizeMaterial(mtrls[0], {
                x: gridX,
                y: gridY,
                width: gridW,
                height: gridH,
              });
            }
          }

          updateSelectedMaterialList([mtrls[0]]);
          modifyType = 'updateMaterial';
          calculator.modifyVirtualItemMap(data, {
            modifyInfo: {
              type: modifyType,
              content: {
                material: mtrls[0],
                position: sharer.getSharedStorage(keySelectedMaterialPosition) || [],
              },
            },
            viewSizeInfo,
            viewScaleInfo,
          });
          viewer.drawFrame();
        }
      } else if (actionType === 'area') {
        sharer.setSharedStorage(keyInBusyMode, 'area');
        sharer.setSharedStorage(keyAreaEnd, e.point);
        viewer.drawFrame();
      }

      const selectedMaterials = sharer.getSharedStorage(keySelectedMaterialList);
      triggerChangeEvent(
        eventHub,
        {
          data,
          type: 'updatingMaterial',
          selectedMaterials,
          hoverMaterial: null,
          modifyRecord: null,
        },
        'continuous'
      );

      sharer.setSharedStorage(keyPrevPoint, e.point);
    },

    pointEnd(e: PointWatcherEvent) {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        return;
      }
      sharer.setSharedStorage(keyInBusyMode, null);
      sharer.setSharedStorage(keyIsMoving, false);
      const data = sharer.getActiveStorage('data');
      const selectedMaterials = sharer.getSharedStorage(keySelectedMaterialList);
      const hoverMaterial = sharer.getSharedStorage(keyHoverMaterial);
      const resizeType = sharer.getSharedStorage(keyResizeType);
      const actionType = sharer.getSharedStorage(keyActionType);
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      let needDrawFrame = false;

      sharer.setSharedStorage(keyPrevPoint, null);
      sharer.setSharedStorage(keyMoveOriginalStartPoint, null);
      sharer.setSharedStorage(keyMoveOriginalStartMaterialSize, null);

      if (actionType === 'drag') {
        eventHub.trigger(MIDDLEWARE_INTERNAL_EVENT_SHOW_INFO_ANGLE, { show: true });
      }

      if (actionType === 'resize' && resizeType) {
        sharer.setSharedStorage(keyResizeType, null);
        needDrawFrame = true;
      } else if (actionType === 'area') {
        if (hoverMaterial?.operations?.locked) {
          sharer.setSharedStorage(keyActionType, 'hover');
        } else {
          sharer.setSharedStorage(keyActionType, null);
        }

        if (data) {
          const start = sharer.getSharedStorage(keyAreaStart);
          const end = sharer.getSharedStorage(keyAreaEnd);
          if (start && end) {
            const { materials } = getSelectedListArea(data, {
              start,
              end,
              calculator,
              viewScaleInfo: sharer.getActiveViewScaleInfo(),
              viewSizeInfo: sharer.getActiveViewSizeInfo(),
            });

            if (materials.length > 0) {
              sharer.setSharedStorage(keyActionType, 'drag-list');
              updateSelectedMaterialList(materials, { triggerEvent: true });
              needDrawFrame = true;
            }
          }
        }
      } else if (actionType === 'drag-list') {
        sharer.setSharedStorage(keyActionType, 'drag-list-end');
        needDrawFrame = true;
      } else if (data) {
        const result = calculator.getPointMaterial(e.point, {
          data,
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
        });
        if (result.material) {
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
        if (data && Array.isArray(data?.materials) && (['drag', 'drag-list'] as ActionType[]).includes(actionType)) {
          const viewInfo = calcMaterialsViewInfo(data.materials, viewSizeInfo, { extend: true });
          sharer.setActiveStorage('contextHeight', viewInfo.contextSize.contextHeight);
          sharer.setActiveStorage('contextWidth', viewInfo.contextSize.contextWidth);
        }

        if (data && (['drag', 'drag-list', 'drag-list-end', 'resize'] as ActionType[]).includes(actionType)) {
          let type: any = 'resizeMaterial';
          if (type === 'resize') {
            type = 'resizeMaterial';
          }
          if (sharer.getSharedStorage(keyHasChangedData)) {
            let modifyRecord: ModifyRecord | null | undefined = null;
            const pointStartMaterialSizeList = sharer.getSharedStorage(keyPointStartMaterialSizeList);
            if (Array.isArray(pointStartMaterialSizeList) && pointStartMaterialSizeList.length) {
              const startSize = pointStartMaterialSizeList[0] as MaterialSize & { id: string };

              if (selectedMaterials.length === 1) {
                modifyRecord = {
                  type: 'resizeMaterial',
                  time: 0,
                  content: {
                    method: 'modifyMaterial',
                    id: startSize.id,
                    before: toFlattenMaterial(startSize),
                    after: toFlattenMaterial(getMaterialSize(selectedMaterials[0])),
                  },
                };
                const startResizeGroupRecord = sharer.getSharedStorage(keyStartResizeGroupRecord);
                const endResizeGroupRecord = sharer.getSharedStorage(keyEndResizeGroupRecord);
                if (selectedMaterials[0].type === 'group' && startResizeGroupRecord && endResizeGroupRecord) {
                  modifyRecord = {
                    ...endResizeGroupRecord,
                    content: {
                      ...endResizeGroupRecord.content,
                      before: startResizeGroupRecord.content.before,
                    },
                  };
                }
              } else if (selectedMaterials.length > 1) {
                modifyRecord = {
                  type: 'resizeMaterials',
                  time: 0,
                  content: {
                    method: 'modifyMaterials',
                    before: pointStartMaterialSizeList.map((item) => ({
                      ...toFlattenMaterial(item),
                      id: item.id,
                    })),
                    after: selectedMaterials.map((item) => ({
                      ...toFlattenMaterial(getMaterialSize(item)),
                      id: item.id,
                    })),
                  },
                };
              }
            }
            triggerChangeEvent(eventHub, { data, type, selectedMaterials, hoverMaterial, modifyRecord });
            sharer.setSharedStorage(keyHasChangedData, false);
          }
        }
        viewer.drawFrame();
      };

      finalDrawFrame();
    },

    pointLeave() {
      sharer.setSharedStorage(keyInBusyMode, null);
      sharer.setSharedStorage(keyResizeType, null);
      eventHub.trigger(coreEventKeys.CURSOR, {
        type: 'default',
      });
    },

    doubleClick(e: PointWatcherEvent) {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        return;
      }
      const enableSelectInGroup = sharer.getSharedStorage(keyEnableSelectInGroup);
      if (enableSelectInGroup === false) {
        return;
      }

      const target = getPointTarget(e.point, pointTargetBaseOptions(e));
      sharer.setSharedStorage(keySelectedMaterialList, []);

      if (
        target.materials.length !== 1 ||
        target.materials[0]?.operations?.locked === true ||
        target.materials[0]?.operations?.invisible === true
      ) {
        return;
      }

      const mtrl = target.materials[0];

      innerConfig?.afterDoubleClickMaterial?.({ material: mtrl });

      if (mtrl?.type === 'group') {
        const pushResult = pushGroupQueue(mtrl as StrictMaterial<'group'>);
        if (pushResult === true) {
          sharer.setSharedStorage(keyActionType, null);
          viewer.drawFrame();
          return;
        }
      } else if (mtrl?.type === 'text') {
        eventHub.trigger(coreEventKeys.TEXT_EDIT, {
          id: mtrl.id,
        });
      }
      // else if (mtrl?.type === 'path') {
      //   eventHub.trigger(coreEventKeys.PATH_EDIT, {
      //     id: mtrl.id,
      //   });
      // }
      sharer.setSharedStorage(keyActionType, null);
    },

    contextMenu: (e: PointWatcherEvent) => {
      if (!isPointInMiddlewareElement(e.nativeEvent, { $root, rootClassName })) {
        return;
      }
      const groupQueue = sharer.getSharedStorage(keyGroupQueue);

      if (groupQueue?.length > 0) {
        if (isPointInActiveGroup(e.nativeEvent, { $root, groupQueue })) {
          const target = getPointTarget(e.point, pointTargetBaseOptions(e));
          if (target?.materials?.length === 1 && target.materials[0]?.operations?.locked !== true) {
            clear();
            updateSelectedMaterialList([target.materials[0]], { triggerEvent: true });
            viewer.drawFrame();
          } else if (!target?.materials?.length) {
            clear();
          }
        }

        return;
      }

      // not in group
      const listAreaSize = calcSelectedMaterialsArea(sharer.getSharedStorage(keySelectedMaterialList), {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator,
      });
      const target = getPointTarget(e.point, {
        ...pointTargetBaseOptions(e),
        areaSize: listAreaSize,
        groupQueue: [],
      });

      if (target?.materials?.length === 1 && target.materials[0]?.operations?.locked !== true) {
        clear();
        updateSelectedMaterialList([target.materials[0]], { triggerEvent: true });
        viewer.drawFrame();
        return;
      } else if (!target?.materials?.length) {
        clear();
      }
    },

    beforeDrawFrame({ snapshot }) {
      renderFrame({
        $root,
        styles,
        boardContent,
        snapshot,
        calculator,
        sharer: opts.sharer,
      });
    },
  };
};
