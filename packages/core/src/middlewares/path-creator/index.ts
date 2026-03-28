import type {
  Point,
  Middleware,
  CoreEventMap,
  StrictMaterial,
  ModifyRecord,
  MiddlewarePathCreatorConfig,
} from '@idraw/types';
import {
  createId,
  getHTMLElementRectInPage,
  calcPointFromView,
  createUUID,
  convertLineToExactCurveCommand,
  updateMaterialInList,
  refinePathMaterial,
  deepClone,
} from '@idraw/util';
import { coreEventKeys } from '../../static';
import type { PathSharedStorage } from './types';
import {
  initRoot,
  clearRoot,
  appendAnchorElement,
  updateAnchorsStyle,
  isAnchorElement,
  getIndexFromAnchorElement,
  initStyles,
  destroyStyles,
} from './dom';
import { defaultConfig, getRootClassName, getMiddlewarePathCreatorStyles } from './static';
import { triggerChangeEvent } from '../common';

export { getMiddlewarePathCreatorStyles };

export const MiddlewarePathCreator: Middleware<PathSharedStorage, CoreEventMap, MiddlewarePathCreatorConfig> = (
  opts,
  config
) => {
  const innerConfig = { ...defaultConfig, ...config };
  const { defaultStrokeWidth, defaultStroke } = innerConfig;
  const styles = getMiddlewarePathCreatorStyles(innerConfig);
  const rootClassName = getRootClassName();

  const { viewer, eventHub, sharer, calculator } = opts;
  const container = opts.container;
  const id = rootClassName;
  let root: HTMLDivElement | null = null;
  let pathCommandIndex: number = -1;
  let createdPathMaterial: StrictMaterial<'path'> | null = null;
  let prevPoint: Point | null = null;

  const clearData = () => {
    clearRoot(root);
    prevPoint = null;
    createdPathMaterial = null;
    pathCommandIndex = -1;
  };

  const refineData = () => {
    if (!createdPathMaterial) {
      return;
    }
    createdPathMaterial = refinePathMaterial(createdPathMaterial);
    const data = sharer.getActiveStorage('data');
    updateMaterialInList(
      createdPathMaterial.id,
      {
        x: createdPathMaterial.x,
        y: createdPathMaterial.y,
        width: createdPathMaterial.width,
        height: createdPathMaterial.height,
        commands: createdPathMaterial.commands,
      },
      data.materials
    );
    calculator.modifyVirtualAttributes(createdPathMaterial, {
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: [],
    });
    calculator.forceVisiable(createdPathMaterial.id);
    viewer.drawFrame();
  };

  const refreshMaterials = () => {
    if (!createdPathMaterial) {
      return;
    }
    const data = sharer.getActiveStorage('data');

    if (pathCommandIndex > 0) {
      updateMaterialInList(
        createdPathMaterial.id,
        {
          x: createdPathMaterial.x,
          y: createdPathMaterial.y,
          width: createdPathMaterial.width,
          height: createdPathMaterial.height,
          commands: createdPathMaterial.commands,
        },
        data.materials
      );
    } else {
      data.materials.push(createdPathMaterial);
      const modifyRecord: ModifyRecord<'addMaterial'> = {
        type: 'addMaterial',
        time: Date.now(),
        content: {
          method: 'addMaterial',
          id: createdPathMaterial.id,
          position: [data.materials?.length],
          material: deepClone(createdPathMaterial),
        },
      };
      triggerChangeEvent(eventHub, { data, type: 'addMaterial', modifyRecord });
    }

    calculator.modifyVirtualAttributes(createdPathMaterial, {
      viewScaleInfo: sharer.getActiveViewScaleInfo(),
      viewSizeInfo: sharer.getActiveViewSizeInfo(),
      groupQueue: [],
    });
    calculator.forceVisiable(createdPathMaterial.id);
    viewer.drawFrame();
  };

  const mouseDownEvent = (e: MouseEvent) => {
    const $target = e.target as HTMLElement;
    if (isAnchorElement($target)) {
      const index = getIndexFromAnchorElement($target);
      if (index === 0 && pathCommandIndex > 1 && createdPathMaterial) {
        createdPathMaterial.commands.push({
          id: createId(),
          type: 'Z',
          params: [],
        });
        refineData();
        clearData();
      }
      return;
    }
    const rootRect = getHTMLElementRectInPage(root as HTMLDivElement);
    const viewPoint = {
      x: e.pageX - rootRect.pageX,
      y: e.pageY - rootRect.pageY,
    };

    const viewScaleInfo = sharer.getActiveViewScaleInfo();
    const viewSizeInfo = sharer.getActiveViewSizeInfo();

    const point = calcPointFromView(viewPoint, {
      viewScaleInfo,
    });

    const { id } = appendAnchorElement(root as HTMLElement, { point, viewScaleInfo, styles });

    if (pathCommandIndex < 0 || !createdPathMaterial) {
      pathCommandIndex = 0;
      createdPathMaterial = {
        id: createUUID(),
        type: 'path',
        x: 0,
        y: 0,
        width: viewSizeInfo.width,
        height: viewSizeInfo.height,
        strokeWidth: defaultStrokeWidth,
        stroke: defaultStroke,
        commands: [{ id, type: 'M', params: [point.x, point.y] }],
      };
    } else {
      pathCommandIndex++;
      (createdPathMaterial as StrictMaterial<'path'>).commands.push({
        ...convertLineToExactCurveCommand(prevPoint as Point, point),
        id,
      });
    }

    // createdPathMaterial = refinePathMaterial(createdPathMaterial);
    prevPoint = point;

    refreshMaterials();
  };

  const mouseMoveEvent = () => {
    // TODO
  };

  const mouseUpEvent = () => {
    window.removeEventListener('mousemove', mouseMoveEvent);
  };

  const mouseLeaveEvent = () => {
    window.removeEventListener('mousemove', mouseMoveEvent);
    // TODO
  };

  const onEvents = () => {
    root?.addEventListener('mousedown', mouseDownEvent);
    // window.addEventListener('mousemove', mouseMoveEvent);
    window.addEventListener('mouseup', mouseUpEvent);
    window.addEventListener('mouseleave', mouseLeaveEvent);
  };

  const offEvents = () => {
    root?.removeEventListener('mousedown', mouseDownEvent);
    // window.removeEventListener('mousemove', mouseMoveEvent);
    window.removeEventListener('mouseup', mouseUpEvent);
    window.removeEventListener('mouseleave', mouseLeaveEvent);
  };

  const init = () => {
    if (!container) {
      return;
    }
    root = initRoot(container, { id, rootClassName }) as HTMLDivElement;
    if (!container.contains(root)) {
      container.appendChild(root);
    }
  };

  const destroy = () => {
    offEvents();
    root?.remove();
    root = null;
  };

  const pathCreateCallback = () => {
    // TODO: reset root doms
    onEvents();

    viewer.drawFrame();
  };

  const clearPathCreateCallback = () => {
    refineData();
    offEvents();
    clearData();
  };

  const clear = () => {
    clearData();
    viewer.drawFrame();
  };

  return {
    name: '@middleware/pen-create',
    use() {
      initStyles(rootClassName, styles);
      eventHub.on(coreEventKeys.PATH_CREATE, pathCreateCallback);
      eventHub.on(coreEventKeys.CLEAR_PATH_CREATE, clearPathCreateCallback);
      init();
    },
    disuse() {
      destroyStyles(rootClassName);
      eventHub.off(coreEventKeys.PATH_CREATE, pathCreateCallback);
      eventHub.off(coreEventKeys.CLEAR_PATH_CREATE, clearPathCreateCallback);
      clear();
      destroy();
    },
    beforeDrawFrame() {
      updateAnchorsStyle(root as HTMLDivElement, {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        styles,
      });
    },
    hover() {
      eventHub.trigger(coreEventKeys.CURSOR, {
        type: 'pen',
      });
      return false;
    },
  };
};
