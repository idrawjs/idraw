import type { BoardMiddleware, ElementSize, Point } from '@idraw/types';
import { calcLayoutSizeController, isViewPointInVertexes, getViewScaleInfoFromSnapshot } from '@idraw/util';
import type { LayoutSelectorSharedStorage, ControlType } from './types';
import { keyLayoutActionType, keyLayoutController, keyLayoutControlType } from './config';
import { keyActionType as keyElementActionType, middlewareEventSelectClear } from '../selector';
import { drawLayoutController } from './util';
import { eventChange } from '../../config';

export const MiddlewareLayoutSelector: BoardMiddleware<LayoutSelectorSharedStorage> = (opts) => {
  const { sharer, boardContent, calculator, viewer, eventHub } = opts;
  const { helperContext } = boardContent;

  let prevPoint: Point | null = null;

  const clear = () => {
    prevPoint = null;
    sharer.setSharedStorage(keyLayoutActionType, null);
    sharer.setSharedStorage(keyLayoutControlType, null);
    sharer.setSharedStorage(keyLayoutController, null);
  };

  const isInElementAction = () => {
    const elementType = sharer.getSharedStorage(keyElementActionType);
    if (elementType) {
      return true;
    }
    return false;
  };

  const isDisbaledControl = (controlType: ControlType) => {
    const data = sharer.getActiveStorage('data');
    if (data?.layout?.operations) {
      const operations = data.layout.operations;
      if (controlType === 'left' && operations.disabledLeft === true) {
        return true;
      }
      if (controlType === 'top' && operations.disabledTop === true) {
        return true;
      }
      if (controlType === 'right' && operations.disabledRight === true) {
        return true;
      }
      if (controlType === 'bottom' && operations.disabledBottom === true) {
        return true;
      }
      if (controlType === 'top-left' && operations.disabledTopLeft === true) {
        return true;
      }
      if (controlType === 'top-right' && operations.disabledTopRight === true) {
        return true;
      }
      if (controlType === 'bottom-left' && operations.disabledBottomLeft === true) {
        return true;
      }
      if (controlType === 'bottom-right' && operations.disabledBottomRight === true) {
        return true;
      }
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
          eventHub.trigger(middlewareEventSelectClear, {});
          return layoutControlType;
        }
      }
    }
    return null;
  };

  return {
    name: '@middleware/layout-selector',
    use: () => {
      clear();
      resetController();
    },
    hover: (e) => {
      if (isInElementAction()) {
        return;
      }
      const prevLayoutActionType = sharer.getSharedStorage(keyLayoutActionType);

      const data = sharer.getActiveStorage('data');
      if (data?.layout && prevLayoutActionType !== 'resize') {
        resetController();
        const layoutControlType = resetControlType(e);
        if (layoutControlType) {
          sharer.setSharedStorage(keyLayoutActionType, 'hover');
          if (!isDisbaledControl(layoutControlType)) {
            eventHub.trigger('cursor', {
              type: `resize-${layoutControlType}`,
              groupQueue: [],
              element: getLayoutSize()
            });
          }

          viewer.drawFrame();
        } else {
          sharer.setSharedStorage(keyLayoutActionType, null);
        }
      }
      if (['hover', 'resize'].includes(sharer.getSharedStorage(keyLayoutActionType) as string)) {
        return false;
      }
      if (prevLayoutActionType === 'hover' && !sharer.getSharedStorage(keyLayoutActionType)) {
        viewer.drawFrame();
      }
    },
    pointStart: (e) => {
      if (isInElementAction()) {
        return;
      }
      resetController();
      const layoutControlType = resetControlType(e);
      prevPoint = e.point;
      if (layoutControlType) {
        if (isDisbaledControl(layoutControlType)) {
          return;
        }
        sharer.setSharedStorage(keyLayoutActionType, 'resize');
        return false;
      }
      const layoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      if (['hover', 'resize'].includes(layoutActionType as string)) {
        return false;
      }
    },
    pointMove: (e) => {
      if (isInElementAction()) {
        return;
      }
      const layoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      const layoutControlType = sharer.getSharedStorage(keyLayoutControlType);
      const data = sharer.getActiveStorage('data');
      if (layoutControlType && isDisbaledControl(layoutControlType)) {
        return;
      }

      if (layoutActionType === 'resize' && layoutControlType && data?.layout) {
        if (prevPoint) {
          const scale = sharer.getActiveStorage('scale');
          const moveX = (e.point.x - prevPoint.x) / scale;
          const moveY = (e.point.y - prevPoint.y) / scale;
          const { x, y, w, h } = data.layout;

          if (layoutControlType === 'top') {
            data.layout.y = calculator.toGridNum(y + moveY);
            data.layout.h = calculator.toGridNum(h - moveY);
          } else if (layoutControlType === 'right') {
            data.layout.w = calculator.toGridNum(w + moveX);
          } else if (layoutControlType === 'bottom') {
            data.layout.h = calculator.toGridNum(h + moveY);
          } else if (layoutControlType === 'left') {
            data.layout.x = calculator.toGridNum(x + moveX);
            data.layout.w = calculator.toGridNum(w - moveX);
          } else if (layoutControlType === 'top-left') {
            data.layout.x = calculator.toGridNum(x + moveX);
            data.layout.y = calculator.toGridNum(y + moveY);
            data.layout.w = calculator.toGridNum(w - moveX);
            data.layout.h = calculator.toGridNum(h - moveY);
          } else if (layoutControlType === 'top-right') {
            data.layout.y = calculator.toGridNum(y + moveY);
            data.layout.w = calculator.toGridNum(w + moveX);
            data.layout.h = calculator.toGridNum(h - moveY);
          } else if (layoutControlType === 'bottom-right') {
            data.layout.w = calculator.toGridNum(w + moveX);
            data.layout.h = calculator.toGridNum(h + moveY);
          } else if (layoutControlType === 'bottom-left') {
            data.layout.x = calculator.toGridNum(x + moveX);
            data.layout.w = calculator.toGridNum(w - moveX);
            data.layout.h = calculator.toGridNum(h + moveY);
          }
        }
        prevPoint = e.point;
        resetController();
        viewer.drawFrame();

        return false;
      }

      if (['hover', 'resize'].includes(layoutActionType as string)) {
        return false;
      }
    },
    pointEnd: () => {
      const layoutActionType = sharer.getSharedStorage(keyLayoutActionType);
      const layoutControlType = sharer.getSharedStorage(keyLayoutControlType);
      const data = sharer.getActiveStorage('data');
      if (data && layoutActionType === 'resize' && layoutControlType && !isDisbaledControl(layoutControlType)) {
        eventHub.trigger(eventChange, {
          type: 'changeLayout',
          data
        });
      }

      clear();
    },
    beforeDrawFrame: ({ snapshot }) => {
      const { sharedStore, activeStore } = snapshot;
      const layoutActionType = sharedStore[keyLayoutActionType];
      const layoutControlType = sharedStore[keyLayoutControlType];

      if (activeStore.data?.layout && layoutActionType && layoutControlType) {
        if (['hover', 'resize'].includes(layoutActionType)) {
          const viewScaleInfo = getViewScaleInfoFromSnapshot(snapshot);
          const { x, y, w, h } = activeStore.data.layout;
          const size = { x, y, w, h };
          const controller = calcLayoutSizeController(size, { viewScaleInfo, controllerSize: 10 });

          drawLayoutController(helperContext, { controller, operations: activeStore.data.layout.operations || {} });
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
