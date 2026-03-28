import type {
  Middleware,
  CoreEventMap,
  StrictMaterial,
  MaterialSize,
  Point,
  PathAnchorCommand,
  PathCommand,
  MiddlewarePathEditorConfig,
} from '@idraw/types';
import {
  createId,
  calcPointMoveMaterialInGroup,
  getMaterialSize,
  updateMaterialInList,
  moveInAnchorCommands,
  moveCurveCtrlInAnchorCommands,
  addClassName,
  removeClassName,
  refinePathMaterial,
  getMaterialAndGroupQueueFromList,
} from '@idraw/util';
import { coreEventKeys } from '../../static';
import {
  ATTR_HELPER_TYPE,
  HELPER_ANCHOR,
  HELPER_DIRECTOR,
  classNameMap,
  defaultStyles,
  getRootClassName,
  getMiddlewarePathEditorStyles,
} from './static';
import type { PathEditorSharedStorage, DirectorInfo, AnchorInfo } from './types';
import { resetRoot, resetAnchorStyle, getAnchorHandlerInfo, getDirectorHandlerInfo } from './dom';
import { calcPointInCanvas, getPathAnchorCommands } from './util';
import { calcPathSize, initRoot, initStyles, destroyStyles } from './dom';

export { getMiddlewarePathEditorStyles };

export const MiddlewarePathEditor: Middleware<PathEditorSharedStorage, CoreEventMap, MiddlewarePathEditorConfig> = (
  opts,
  config
) => {
  const { viewer, eventHub, sharer, calculator } = opts;
  const innerConfig = {
    ...defaultStyles,
    ...config,
  };
  const { afterClickAway } = innerConfig;
  const rootClassName = getRootClassName();

  const styles = getMiddlewarePathEditorStyles(innerConfig);

  const container = opts.container;
  const id = `idraw-middleware-path-editor-${createId()}`;
  let root: HTMLDivElement | null = null;
  let showEditor = false;

  let hasInitedEvent = false;
  let handlerStatus: 'dragging-anchor' | 'dragging-director' | null = null;
  let selectedPathMaterial: StrictMaterial<'path'> | null = null;
  let selectedGroupQueue: StrictMaterial<'group'>[] | null = null;
  let prevPoint: Point | null = null;
  let moveOriginalStartMaterialSize: MaterialSize | null = null;
  let selectedAnchorHandler: HTMLElement | null = null;
  let selectedAnchorHandlerInfo: AnchorInfo | null = null;
  let selectedPathAnchorCommands: PathAnchorCommand[] | null = null;

  let selectedDirectorHandler: HTMLElement | null = null;
  let selectedDirectorHandlerInfo: DirectorInfo | null = null;

  const clearData = () => {
    selectedPathMaterial = null;
    clearMoveData();
    clearSelectedAnchorData();
  };

  const clearSelectedAnchorData = () => {
    clearSelectedDirectorData();
    selectedAnchorHandler = null;
    selectedAnchorHandlerInfo = null;
    selectedPathAnchorCommands = null;
  };

  const clearSelectedDirectorData = () => {
    selectedDirectorHandler = null;
    selectedDirectorHandlerInfo = null;
  };

  const clearSelectedStatus = () => {
    if (!root) {
      return;
    }
    const $selectedHandlers: HTMLElement[] = Array.from(
      root.getElementsByClassName(classNameMap.selected)
    ) as HTMLElement[];

    $selectedHandlers.forEach(($handler) => {
      removeClassName($handler, [classNameMap.selected]);
    });
  };

  const clearMoveData = () => {
    handlerStatus = null;
    prevPoint = null;
    moveOriginalStartMaterialSize = null;
  };

  const mouseDownEvent = (e: MouseEvent) => {
    const handler = e.target as HTMLElement;
    const helperType = handler?.getAttribute(ATTR_HELPER_TYPE);

    if (helperType === HELPER_ANCHOR && selectedPathMaterial) {
      e.stopPropagation();
      e.preventDefault();
      clearSelectedAnchorData();
      moveOriginalStartMaterialSize = getMaterialSize(selectedPathMaterial);
      const start = calcPointInCanvas(e, root as HTMLElement);
      prevPoint = start;
      handlerStatus = 'dragging-anchor';
      selectedAnchorHandler = handler;
      selectedAnchorHandlerInfo = getAnchorHandlerInfo(handler);
      selectedPathAnchorCommands = getPathAnchorCommands(selectedPathMaterial, { calculator });
      window.addEventListener('mousemove', mouseMoveEvent);
      addClassName(selectedAnchorHandler, [classNameMap.selected]);
      viewer.drawFrame();
    } else if (helperType === HELPER_DIRECTOR && selectedPathMaterial) {
      e.stopPropagation();
      e.preventDefault();
      clearSelectedDirectorData();
      moveOriginalStartMaterialSize = getMaterialSize(selectedPathMaterial);
      const start = calcPointInCanvas(e, root as HTMLElement);
      prevPoint = start;
      handlerStatus = 'dragging-director';
      selectedDirectorHandler = handler;
      selectedDirectorHandlerInfo = getDirectorHandlerInfo(handler);
      selectedPathAnchorCommands = getPathAnchorCommands(selectedPathMaterial, { calculator });
      window.addEventListener('mousemove', mouseMoveEvent);
      addClassName(selectedDirectorHandler, [classNameMap.selected]);
      viewer.drawFrame();
    } else {
      clearPathEditCallback();
      afterClickAway?.();
    }
  };

  const mouseMoveEvent = (e: MouseEvent) => {
    if (prevPoint && selectedPathMaterial && moveOriginalStartMaterialSize && selectedPathAnchorCommands) {
      const current = calcPointInCanvas(e, root as HTMLElement);
      const queue: StrictMaterial<'group'>[] = [
        ...(selectedGroupQueue || []),
        {
          ...moveOriginalStartMaterialSize,
          type: 'group',
          id: selectedPathMaterial.id,
          angle: selectedPathMaterial.angle,
          children: [],
        },
      ];
      const { moveX, moveY } = calcPointMoveMaterialInGroup(prevPoint, current, queue);
      const scale = sharer.getActiveStorage('scale') || 1;
      const totalMoveX = calculator.toGridNum(moveX / scale);
      const totalMoveY = calculator.toGridNum(moveY / scale);

      const acmds = [...selectedPathAnchorCommands];

      if (selectedAnchorHandler && selectedAnchorHandlerInfo && handlerStatus === 'dragging-anchor') {
        const newAcmds = moveInAnchorCommands(acmds, {
          type: 'start',
          index: selectedAnchorHandlerInfo.index,
          moveX: totalMoveX,
          moveY: totalMoveY,
        });
        const data = sharer.getActiveStorage('data');

        const newCommands: PathCommand[] = newAcmds.map(({ id, type, params }) => ({ id, type, params }));

        updateMaterialInList(
          selectedPathMaterial.id,
          {
            commands: newCommands,
          },
          data.materials
        );

        // calculator
        selectedPathMaterial.commands = newCommands;
        calculator.modifyVirtualAttributes(selectedPathMaterial, {
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
          groupQueue: selectedGroupQueue || [],
        });

        viewer.drawFrame();
      } else if (selectedDirectorHandler && selectedDirectorHandlerInfo && handlerStatus === 'dragging-director') {
        const { type, fromAnchorId } = selectedDirectorHandlerInfo;
        const updatedCmdIndex = acmds.findIndex((item) => item.id === fromAnchorId);

        const newAcmds = moveCurveCtrlInAnchorCommands(acmds, {
          type,
          index: updatedCmdIndex,
          moveX: totalMoveX,
          moveY: totalMoveY,
        });
        const data = sharer.getActiveStorage('data') || { materials: [] };
        const newCommands: PathCommand[] = newAcmds.map(({ id, type, params }) => ({ id, type, params }));

        updateMaterialInList(
          selectedPathMaterial.id,
          {
            commands: newCommands,
          },
          data.materials
        );

        // calculator
        selectedPathMaterial.commands = newCommands;
        calculator.modifyVirtualAttributes(selectedPathMaterial, {
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          viewSizeInfo: sharer.getActiveViewSizeInfo(),
          groupQueue: selectedGroupQueue || [],
        });

        viewer.drawFrame();
      }
    }
  };

  const resetPathSize = () => {
    // TODO
    calcPathSize(root);
  };

  const refineAction = () => {
    if (!selectedPathMaterial) {
      return;
    }
    selectedPathMaterial = refinePathMaterial(selectedPathMaterial);
    const data = sharer.getActiveStorage('data') || { materials: [] };

    updateMaterialInList(
      selectedPathMaterial.id,
      {
        x: selectedPathMaterial.x,
        y: selectedPathMaterial.y,
        width: selectedPathMaterial.width,
        height: selectedPathMaterial.height,
        commands: selectedPathMaterial.commands,
      },
      data.materials
    );
    calculator.modifyVirtualAttributes(selectedPathMaterial, {
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: selectedGroupQueue || [],
    });
    viewer.drawFrame();
  };

  const mouseUpEvent = () => {
    window.removeEventListener('mousemove', mouseMoveEvent);
    refineAction();
    clearSelectedStatus();
    clearMoveData();
    resetPathSize();
  };

  const mouseLeaveEvent = () => {
    window.removeEventListener('mousemove', mouseMoveEvent);
    refineAction();
    clearSelectedStatus();
    clearMoveData();
    resetPathSize();
  };

  const onEvents = () => {
    if (hasInitedEvent) {
      return;
    }
    root?.addEventListener('mousedown', mouseDownEvent);
    window.addEventListener('mouseup', mouseUpEvent);
    window.addEventListener('mouseleave', mouseLeaveEvent);
    hasInitedEvent = true;
  };

  const offEvents = () => {
    root?.removeEventListener('mousedown', mouseDownEvent);
    window.removeEventListener('mouseup', mouseUpEvent);
    window.removeEventListener('mouseleave', mouseLeaveEvent);
    hasInitedEvent = false;
  };

  const init = () => {
    if (!container) {
      return;
    }
    root = initRoot(container, { id, rootClassName }) as HTMLDivElement;
    if (!container.contains(root)) {
      container.appendChild(root);
    }
    showEditor = true;
  };

  const destroy = () => {
    offEvents();
    root?.remove();
    root = null;
    showEditor = false;
  };

  const pathEditCallback = (e: CoreEventMap[typeof coreEventKeys.PATH_EDIT]) => {
    init();
    const { id } = e;

    if (typeof id === 'string' && id) {
      const data = sharer.getActiveStorage('data');
      const { groupQueue, material } = getMaterialAndGroupQueueFromList(id, data.materials);
      if (material?.type === 'path') {
        selectedPathMaterial = material as StrictMaterial<'path'>;
        selectedGroupQueue = [...groupQueue];
        resetRoot(root, {
          material: material as StrictMaterial<'path'> | null,
          groupQueue,
          calculator,
          viewScaleInfo: sharer.getActiveViewScaleInfo(),
          styles,
        });
        onEvents();
        const map = sharer.getActiveOverrideMaterialMap() || {};
        map[material.id] = {
          operations: { renderPathTrace: true },
        };
        sharer.setActiveOverrideMaterialMap(map);
        viewer.drawFrame();
      }
    }
  };

  const clearPathEditCallback = () => {
    const map = sharer.getActiveOverrideMaterialMap() || {};
    delete map[(selectedPathMaterial as StrictMaterial<'path'>)?.id];
    sharer.setActiveOverrideMaterialMap(map);
    clearData();
    destroy();
    viewer.drawFrame();
  };

  return {
    name: '@middleware/pen-edit',
    use() {
      initStyles(rootClassName, styles);
      eventHub.on(coreEventKeys.PATH_EDIT, pathEditCallback);
      eventHub.on(coreEventKeys.CLEAR_PATH_EDIT, clearPathEditCallback);
    },
    disuse() {
      destroyStyles(rootClassName);
      eventHub.off(coreEventKeys.PATH_EDIT, pathEditCallback);
      eventHub.off(coreEventKeys.CLEAR_PATH_EDIT, clearPathEditCallback);
    },
    beforeDrawFrame() {
      resetAnchorStyle(root, {
        selectedAnchorId: selectedAnchorHandlerInfo?.id,
        material: selectedPathMaterial,
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        calculator,
        styles,
      });
    },
    hover() {
      return !showEditor;
    },
    pointStart() {
      return !showEditor;
    },
    pointMove() {
      return !showEditor;
    },
    pointEnd() {
      return !showEditor;
    },
    pointLeave() {
      return !showEditor;
    },
    doubleClick() {
      return !showEditor;
    },
    contextMenu() {
      return !showEditor;
    },
    wheel() {
      return !showEditor;
    },
    wheelScale() {
      return !showEditor;
    },
    scrollX() {
      return !showEditor;
    },
    scrollY() {
      return !showEditor;
    },
    resize() {
      return !showEditor;
    },
  };
};
