import type { BoardMiddleware, ElementSize, Point, MiddlewareLayoutSelectorConfig, CoreEventMap } from '@idraw/types';
import { calcLayoutSizeController, isViewPointInVertexes, getViewScaleInfoFromSnapshot, isViewPointInElementSize, calcViewElementSize } from '@idraw/util';
import type { LayoutSelectorSharedStorage, ControlType } from './types';
import {
  keyLayoutActionType,
  keyLayoutController,
  keyLayoutControlType,
  keyLayoutIsHoverContent,
  keyLayoutIsHoverController,
  keyLayoutIsSelected,
  keyLayoutIsBusyMoving,
  controllerSize,
  defaultStyle
} from './config';
import {
  keyActionType as keyElementActionType
  // keyHoverElement
} from '../selector';
import { drawLayoutController, drawLayoutHover } from './util';
import { coreEventKeys } from '../../config';

export { keyLayoutIsSelected, keyLayoutIsBusyMoving };

export const MiddlewareLayoutSelector: BoardMiddleware<LayoutSelectorSharedStorage, CoreEventMap, MiddlewareLayoutSelectorConfig> = (opts, config) => {
  const { sharer, boardContent, calculator, viewer, eventHub } = opts;
  const { overlayContext } = boardContent;
  let innerConfig = {
    ...defaultStyle,
    ...config
  };

  let prevPoint: Point | null = null;
  let prevIsHoverContent: boolean | null = null;
  let prevIsSelected: boolean | null = null;

  const clear = () => {
    prevPoint = null;
    sharer.setSharedStorage(keyLayoutActionType, null);
    sharer.setSharedStorage(keyLayoutControlType, null);
    sharer.setSharedStorage(keyLayoutController, null);
    sharer.setSharedStorage(keyLayoutIsHoverContent, null);
    sharer.setSharedStorage(keyLayoutIsHoverController, null);
    sharer.setSharedStorage(keyLayoutIsSelected, null);
    sharer.setSharedStorage(keyLayoutIsBusyMoving, null);
    prevIsHoverContent = null;
    prevIsSelected = null;
  };

  // const isInElementHover = () => {
  //   const hoverElement = sharer.getSharedStorage(keyHoverElement);
  //   if (hoverElement) {
  //     clear();
  //     return true;
  //   }
  //   return false;
  // };

  const isInElementAction = () => {
    const elementActionType = sharer.getSharedStorage(keyElementActionType);
    if (elementActionType && elementActionType !== 'area') {
      clear();
      return true;
    }
    return false;
  };

  const getLayoutSize = () => {
    const data = sharer.getActiveStorage('data');
    if (data?.layout) {
      const { x, y, w, h } = data.layout;
      return { x, y, w, h };
    }
    return null;
  };

  const isInLayout = (p: Point) => {
    const size = getLayoutSize();
    if (size) {
      const { x, y, w, h } = size;
      const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSize = calcViewElementSize(
        {
          x: x - controllerSize / 2,
          y: y - controllerSize / 2,
          w: w + controllerSize,
          h: h + controllerSize
        },
        { viewScaleInfo }
      );
      return isViewPointInElementSize(p, viewSize);
    }
    return false;
  };

  const resetController = () => {
    const viewScaleInfo = sharer.getActiveViewScaleInfo();
    const size: ElementSize | null = getLayoutSize();
    if (size) {
      const controller = calcLayoutSizeController(size, { viewScaleInfo, controllerSize: 10 });
      sharer.setSharedStorage(keyLayoutController, controller);
    } else {
      sharer.setSharedStorage(keyLayoutController, null);
    }
  };

  const resetControlType = (e?: { point: Point }) => {
    const data = sharer.getActiveStorage('data');
    const controller = sharer.getSharedStorage(keyLayoutController);
    let controllerType: ControlType | null = null;
    if (controller && data?.layout && e?.point) {
      // sharer.setSharedStorage(keyLayoutControlType, null);
      let layoutControlType: ControlType | null = null;
      if (controller) {
        const { topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left } = controller;
        const list = [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left];
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (isViewPointInVertexes(e.point, item.vertexes)) {
            layoutControlType = `${item.type}` as ControlType;
            break;
          }
        }
        if (layoutControlType) {
          sharer.setSharedStorage(keyLayoutControlType, layoutControlType);
          eventHub.trigger(coreEventKeys.CLEAR_SELECT);
          controllerType = layoutControlType;
        }
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
      element: getLayoutSize()
    });
  };

  return {
    name: '@middleware/layout-selector',

    use: () => {
      clear();
      resetController();
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    hover: (e) => {
      if (sharer.getSharedStorage(keyLayoutIsBusyMoving) === true) {
        return;
      }
      if (isInElementAction()) {
        return;
      }
      // if (isInElementHover()) {
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

      if (sharer.getSharedStorage(keyLayoutIsSelected) === true) {
        const prevLayoutActionType = sharer.getSharedStorage(keyLayoutActionType);
        const data = sharer.getActiveStorage('data');

        if (data?.layout) {
          if (prevLayoutActionType !== 'resize') {
            resetController();
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
        if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
          return false;
        }
        return;
      }

      if (sharer.getSharedStorage(keyLayoutIsHoverContent) && !prevIsHoverContent) {
        viewer.drawFrame();
      }
      prevIsHoverContent = sharer.getSharedStorage(keyLayoutIsHoverContent);

      if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
        return false;
      }
    },

    pointStart: (e) => {
      if (isInElementAction()) {
        return;
      }

      if (isInLayout(e.point)) {
        sharer.setSharedStorage(keyLayoutIsSelected, true);
      } else {
        if (prevIsSelected === true) {
          clear();
          viewer.drawFrame();
        }
        sharer.setSharedStorage(keyLayoutIsSelected, false);
      }

      resetController();
      const layoutControlType = resetControlType(e);
      prevPoint = e.point;

      if (layoutControlType) {
        sharer.setSharedStorage(keyLayoutActionType, 'resize');
      }

      if (sharer.getSharedStorage(keyLayoutIsSelected) === true && !prevIsSelected) {
        viewer.drawFrame();
      }
      prevIsSelected = sharer.getSharedStorage(keyLayoutIsSelected);

      if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
        return false;
      }
    },

    pointMove: (e) => {
      if (!sharer.getSharedStorage(keyLayoutIsSelected)) {
        if (isInElementAction()) {
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
          const { x, y, w, h, operations = {} } = data.layout;
          const { position = 'absolute' } = operations;
          if (layoutControlType === 'top') {
            if (position === 'relative') {
              data.layout.h = calculator.toGridNum(h - moveY);
              viewer.scroll({ moveY: viewMoveY });
            } else {
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.h = calculator.toGridNum(h - moveY);
            }
          } else if (layoutControlType === 'right') {
            data.layout.w = calculator.toGridNum(w + moveX);
          } else if (layoutControlType === 'bottom') {
            data.layout.h = calculator.toGridNum(h + moveY);
          } else if (layoutControlType === 'left') {
            if (position === 'relative') {
              data.layout.w = calculator.toGridNum(w - moveX);
              viewer.scroll({ moveX: viewMoveX });
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.w = calculator.toGridNum(w - moveX);
            }
          } else if (layoutControlType === 'top-left') {
            if (position === 'relative') {
              data.layout.w = calculator.toGridNum(w - moveX);
              data.layout.h = calculator.toGridNum(h - moveY);
              viewer.scroll({ moveX: viewMoveX, moveY: viewMoveY });
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.w = calculator.toGridNum(w - moveX);
              data.layout.h = calculator.toGridNum(h - moveY);
            }
          } else if (layoutControlType === 'top-right') {
            if (position === 'relative') {
              viewer.scroll({
                moveY: viewMoveY
              });
              data.layout.w = calculator.toGridNum(w + moveX);
              data.layout.h = calculator.toGridNum(h - moveY);
            } else {
              data.layout.y = calculator.toGridNum(y + moveY);
              data.layout.w = calculator.toGridNum(w + moveX);
              data.layout.h = calculator.toGridNum(h - moveY);
            }
          } else if (layoutControlType === 'bottom-right') {
            data.layout.w = calculator.toGridNum(w + moveX);
            data.layout.h = calculator.toGridNum(h + moveY);
          } else if (layoutControlType === 'bottom-left') {
            if (position === 'relative') {
              viewer.scroll({
                moveX: viewMoveX
              });
              data.layout.w = calculator.toGridNum(w - moveX);
              data.layout.h = calculator.toGridNum(h + moveY);
            } else {
              data.layout.x = calculator.toGridNum(x + moveX);
              data.layout.w = calculator.toGridNum(w - moveX);
              data.layout.h = calculator.toGridNum(h + moveY);
            }
          }
        }
        prevPoint = e.point;
        resetController();
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
        eventHub.trigger(coreEventKeys.CHANGE, {
          type: 'changeLayout',
          data
        });
      }

      if (sharer.getSharedStorage(keyLayoutIsHoverController) === true) {
        return false;
      }
    },

    beforeDrawFrame: ({ snapshot }) => {
      if (isInElementAction()) {
        return;
      }

      const { activeColor } = innerConfig;
      const style = { activeColor };

      const { sharedStore, activeStore } = snapshot;
      const layoutActionType = sharedStore[keyLayoutActionType];
      const layoutIsHover = sharedStore[keyLayoutIsHoverContent];
      const layoutIsSelected = sharedStore[keyLayoutIsSelected];

      if (activeStore.data?.layout) {
        const { x, y, w, h } = activeStore.data.layout;
        const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
        const size = { x, y, w, h };
        const controller = calcLayoutSizeController(size, { viewScaleInfo, controllerSize });

        if (layoutIsHover === true) {
          const viewSize = calcViewElementSize(size, { viewScaleInfo });
          drawLayoutHover(overlayContext, { layoutSize: viewSize, style });
        }

        if ((layoutActionType && ['resize'].includes(layoutActionType)) || layoutIsSelected === true) {
          drawLayoutController(overlayContext, { controller, style });
        }
      }
    },
    scrollX: () => {
      clear();
    },
    scrollY: () => {
      clear();
    },
    wheelScale: () => {
      clear();
    }
  };
};
