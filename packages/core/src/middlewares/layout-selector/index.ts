import type {
  Middleware,
  MaterialSize,
  Point,
  MiddlewareLayoutSelectorConfig,
  CoreEventMap,
  RecursivePartial,
  ModifyRecord,
  DataLayout,
} from '@idraw/types';
import {
  // calcLayoutSizeController,
  // isViewPointInVertexes,
  // getViewScaleInfoFromSnapshot,
  isViewPointInMaterialSize,
  calcViewMaterialSize,
  getMaterialSize,
  toFlattenLayout,
} from '@idraw/util';
import type { LayoutSelectorSharedStorage, ControlType } from './types';
import {
  keyLayoutActionType,
  // keyLayoutController,
  keyLayoutControlType,
  keyLayoutIsHoverContent,
  keyLayoutIsHoverController,
  keyLayoutIsSelected,
  keyLayoutIsBusyMoving,
  controllerSize,
  defaultStyle,
  getRootClassName,
  ATTR_HANDLER_TYPE,
} from './static';
import { getMiddlewareLayoutSelectorStyles, initStyles, destroyStyles } from './styles';
import {
  keyActionType as keyMaterialActionType,
  // keyHoverMaterial
} from '../selector';
// import { drawLayoutController, drawLayoutHover } from './util';
import { resetMaterialSelectedBox, clearMaterialLayoutBoxs } from './dom';
import { coreEventKeys } from '../../static';
import { triggerChangeEvent } from '../common';

export { keyLayoutIsSelected, keyLayoutIsBusyMoving };

export const MiddlewareLayoutSelector: Middleware<
  LayoutSelectorSharedStorage,
  CoreEventMap,
  MiddlewareLayoutSelectorConfig
> = (opts, config) => {
  const { sharer, calculator, viewer, eventHub } = opts;
  // const { overlayContext } = boardContent;
  let innerConfig = {
    ...defaultStyle,
    ...config,
  };
  const styles = getMiddlewareLayoutSelectorStyles(innerConfig);

  const rootClassName = getRootClassName();

  let prevPoint: Point | null = null;
  let prevIsHoverContent: boolean | null = null;
  let prevIsSelected: boolean | null = null;

  let pointStartLayoutSize: RecursivePartial<MaterialSize> | null = null;

  const clear = () => {
    prevPoint = null;
    sharer.setSharedStorage(keyLayoutActionType, null);
    sharer.setSharedStorage(keyLayoutControlType, null);
    // sharer.setSharedStorage(keyLayoutController, null);
    sharer.setSharedStorage(keyLayoutIsHoverContent, null);
    sharer.setSharedStorage(keyLayoutIsHoverController, null);
    sharer.setSharedStorage(keyLayoutIsSelected, null);
    sharer.setSharedStorage(keyLayoutIsBusyMoving, null);
    prevIsHoverContent = null;
    prevIsSelected = null;
  };

  const isInMaterialAction = () => {
    const materialActionType = sharer.getSharedStorage(keyMaterialActionType);
    if (materialActionType && materialActionType !== 'area') {
      clear();
      return true;
    }
    return false;
  };

  const getLayoutSize = () => {
    const data = sharer.getActiveStorage('data');
    if (data?.layout) {
      const { x, y, width, height } = data.layout;
      return { x, y, width, height };
    }
    return null;
  };

  const isInLayout = (p: Point) => {
    const size = getLayoutSize();
    if (size) {
      const { x, y, width, height } = size;
      const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSize = calcViewMaterialSize(
        {
          x: x - controllerSize / 2,
          y: y - controllerSize / 2,
          width: width + controllerSize,
          height: height + controllerSize,
        },
        { viewScaleInfo }
      );
      return isViewPointInMaterialSize(p, viewSize);
    }
    return false;
  };

  const resetControlType = (e: { point: Point; nativeEvent: Event }) => {
    const data = sharer.getActiveStorage('data');
    const $target = e.nativeEvent.target as HTMLElement;

    let controllerType: ControlType | null = null;
    if ($target?.hasAttribute(ATTR_HANDLER_TYPE) && data?.layout && e?.point) {
      sharer.setSharedStorage(keyLayoutControlType, null);
      const layoutControlType: ControlType | null = $target.getAttribute(ATTR_HANDLER_TYPE) as ControlType | null;

      if (layoutControlType) {
        sharer.setSharedStorage(keyLayoutControlType, layoutControlType);
        eventHub.trigger(coreEventKeys.CLEAR_SELECT);
        controllerType = layoutControlType;
      }
    }

    if (controllerType) {
      sharer.setSharedStorage(keyLayoutIsHoverController, true);
    } else {
      sharer.setSharedStorage(keyLayoutIsHoverController, false);
    }

    return controllerType;
  };

  const updateCursor = (controlType?: ControlType | null) => {
    if (sharer.getSharedStorage(keyLayoutIsBusyMoving) === true) {
      return;
    }
    eventHub.trigger(coreEventKeys.CURSOR, {
      type: controlType ? `resize-${controlType}` : controlType,
      groupQueue: [],
      material: getLayoutSize(),
    });
  };

  return {
    name: '@middleware/layout-selector',

    use: () => {
      clear();
      initStyles(rootClassName, styles);
    },

    disuse: () => {
      clear();
      destroyStyles(rootClassName);
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    hover: (e) => {
      if (sharer.getSharedStorage(keyLayoutIsBusyMoving) === true) {
        return;
      }
      // if (isInMaterialAction()) {
      //   return;
      // }

      if (isInLayout(e.point)) {
        sharer.setSharedStorage(keyLayoutIsHoverContent, true);
      } else {
        sharer.setSharedStorage(keyLayoutIsHoverContent, false);
        if (prevIsHoverContent === true) {
          viewer.drawFrame();
          prevIsHoverContent = false;
        }
      }

      // if (sharer.getSharedStorage(keyLayoutIsSelected) === true) {
      const prevLayoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      const data = sharer.getActiveStorage('data');

      if (data?.layout) {
        if (prevLayoutActionType !== 'resize') {
          const layoutControlType = resetControlType(e);

          if (layoutControlType) {
            updateCursor(layoutControlType);
          } else {
            updateCursor();
            sharer.setSharedStorage(keyLayoutActionType, null);
          }
        } else {
          const layoutControlType = resetControlType(e);
          updateCursor(layoutControlType);
        }
      }
      // if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
      //   return false;
      // }
      // return;
      // }

      // if (sharer.getSharedStorage(keyLayoutIsHoverContent) && !prevIsHoverContent) {
      //   viewer.drawFrame();
      // }
      // prevIsHoverContent = sharer.getSharedStorage(keyLayoutIsHoverContent);

      // if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
      //   return false;
      // }
    },

    pointStart: (e) => {
      // const inMaterial = isInMaterialAction();
      // if (inMaterial) {
      //   if (opts.container) {
      //     clearMaterialLayoutBoxs(opts.container, { rootClassName });
      //   }
      //   return;
      // }

      if (isInLayout(e.point)) {
        sharer.setSharedStorage(keyLayoutIsSelected, true);
      } else {
        if (prevIsSelected === true) {
          if (opts.container) {
            clearMaterialLayoutBoxs(opts.container, { rootClassName });
          }
          clear();
          viewer.drawFrame();
        }
        sharer.setSharedStorage(keyLayoutIsSelected, false);
      }

      const data = sharer.getActiveStorage('data');
      if (data?.layout) {
        pointStartLayoutSize = getMaterialSize(data.layout as any);
      } else {
        pointStartLayoutSize = null;
      }

      const layoutControlType = resetControlType(e);

      prevPoint = e.point;

      if (layoutControlType) {
        sharer.setSharedStorage(keyLayoutActionType, 'resize');
      }

      if (sharer.getSharedStorage(keyLayoutIsSelected) === true && !prevIsSelected) {
        viewer.drawFrame();
        eventHub.trigger(coreEventKeys.SELECT_LAYOUT);
      }
      prevIsSelected = sharer.getSharedStorage(keyLayoutIsSelected);

      if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
        return false;
      }
    },

    pointMove: (e) => {
      if (!sharer.getSharedStorage(keyLayoutIsSelected)) {
        if (isInMaterialAction()) {
          return;
        }
      }

      const layoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      const layoutControlType = sharer.getSharedStorage(keyLayoutControlType);
      const data = sharer.getActiveStorage('data');

      if (layoutActionType === 'resize' && layoutControlType && data?.layout) {
        if (prevPoint) {
          sharer.setSharedStorage(keyLayoutIsBusyMoving, true);
          const scale = sharer.getActiveStorage('scale');
          const viewMoveX = e.point.x - prevPoint.x;
          const viewMoveY = e.point.y - prevPoint.y;
          const moveX = viewMoveX / scale;
          const moveY = viewMoveY / scale;
          const { x, y, width, height, operations = {} } = data.layout;
          const { position = 'absolute' } = operations;
          if (layoutControlType === 'top') {
            if (position === 'relative') {
              data.layout.height = calculator.toGridNum(height - moveY);
              viewer.scroll({ moveY: viewMoveY });
            } else {
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.height = calculator.toGridNum(height - moveY);
            }
          } else if (layoutControlType === 'right') {
            data.layout.width = calculator.toGridNum(width + moveX);
          } else if (layoutControlType === 'bottom') {
            data.layout.height = calculator.toGridNum(height + moveY);
          } else if (layoutControlType === 'left') {
            if (position === 'relative') {
              data.layout.width = calculator.toGridNum(width - moveX);
              viewer.scroll({ moveX: viewMoveX });
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.width = calculator.toGridNum(width - moveX);
            }
          } else if (layoutControlType === 'top-left') {
            if (position === 'relative') {
              data.layout.width = calculator.toGridNum(width - moveX);
              data.layout.height = calculator.toGridNum(height - moveY);
              viewer.scroll({ moveX: viewMoveX, moveY: viewMoveY });
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.width = calculator.toGridNum(width - moveX);
              data.layout.height = calculator.toGridNum(height - moveY);
            }
          } else if (layoutControlType === 'top-right') {
            if (position === 'relative') {
              viewer.scroll({
                moveY: viewMoveY,
              });
              data.layout.width = calculator.toGridNum(width + moveX);
              data.layout.height = calculator.toGridNum(height - moveY);
            } else {
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.width = calculator.toGridNum(width + moveX);
              data.layout.height = calculator.toGridNum(height - moveY);
            }
          } else if (layoutControlType === 'bottom-right') {
            data.layout.width = calculator.toGridNum(width + moveX);
            data.layout.height = calculator.toGridNum(height + moveY);
          } else if (layoutControlType === 'bottom-left') {
            if (position === 'relative') {
              viewer.scroll({
                moveX: viewMoveX,
              });
              data.layout.width = calculator.toGridNum(width - moveX);
              data.layout.height = calculator.toGridNum(height + moveY);
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.width = calculator.toGridNum(width - moveX);
              data.layout.height = calculator.toGridNum(height + moveY);
            }
          }
        }
        prevPoint = e.point;
        viewer.drawFrame();
        return false;
      }

      if (['resize'].includes(layoutActionType as string)) {
        return false;
      }
    },

    pointEnd: () => {
      sharer.setSharedStorage(keyLayoutIsBusyMoving, false);
      const layoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      const layoutControlType = sharer.getSharedStorage(keyLayoutControlType);
      const data = sharer.getActiveStorage('data');
      if (data && layoutActionType === 'resize' && layoutControlType) {
        let modifyRecord: ModifyRecord<'modifyLayout'> | undefined = undefined;
        if (pointStartLayoutSize) {
          modifyRecord = {
            type: 'modifyLayout',
            time: Date.now(),
            content: {
              method: 'modifyLayout',
              before: toFlattenLayout(pointStartLayoutSize as DataLayout),
              after: toFlattenLayout(getMaterialSize(data.layout as any) as DataLayout),
            },
          };
        }
        triggerChangeEvent(eventHub, {
          type: 'resizeLayout',
          data,
          modifyRecord,
        });
      }
      pointStartLayoutSize = null;

      sharer.setSharedStorage(keyLayoutActionType, null);
      sharer.setSharedStorage(keyLayoutControlType, null);

      if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
        return false;
      }
    },

    beforeDrawFrame: ({ snapshot }) => {
      if (isInMaterialAction()) {
        return;
      }

      const {
        // sharedStore,
        activeStore,
      } = snapshot;
      // const layoutActionType = sharedStore[keyLayoutActionType];
      // const layoutIsHover = sharedStore[keyLayoutIsHoverContent];
      // const layoutIsSelected = sharedStore[keyLayoutIsSelected];

      const viewScaleInfo = sharer.getActiveViewScaleInfo();

      if (opts.container && activeStore.data?.layout) {
        // if (activeStore.data?.layout) {
        // if (layoutIsHover === true) {
        //   resetMaterialSelectedBox(opts.container, {
        //     rootClassName,
        //     viewScaleInfo,
        //     layout: activeStore.data?.layout,
        //     hover: true,
        //   });
        // } else if (layoutIsHover === false) {
        //   clearMaterialLayoutBoxs(opts.container, { rootClassName });
        // }

        // if (layoutActionType && ['resize'].includes(layoutActionType)) {
        resetMaterialSelectedBox(opts.container, {
          rootClassName,
          viewScaleInfo,
          layout: activeStore.data?.layout,
          hover: false,
        });
        // }
        // } else {
        //   // clearMaterialLayoutBoxs(opts.container, { rootClassName });
        // }
      }
    },
  };
};
