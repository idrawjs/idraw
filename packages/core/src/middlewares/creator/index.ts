import type {
  Middleware,
  MiddlewareCreatorConfig,
  CoreEventMap,
  MaterialType,
  Material,
  ModifyRecord,
} from '@idraw/types';
import { deepClone, addClassName, removeClassName, updateMaterialInList } from '@idraw/util';
import {
  classNameMap,
  defaultConfig,
  defaultStyles,
  getRootClassName,
  keyStartPoint,
  keyEndPoint,
  keyActiveMaterialType,
} from './static';
import type { CreatorSharedStorage } from './types';
import { initStyles, destroyStyles, getMiddlewareCreatorStyles } from './styles';
import { initRoot, resetCreationAreaBox, clearCreationAreaBox } from './dom';
import { createMaterialByArea, updateMaterialByArea } from './util';
import { coreEventKeys } from '../../static';
import { triggerChangeEvent } from '../common';

export { getMiddlewareCreatorStyles };

export const MiddlewareCreator: Middleware<CreatorSharedStorage, CoreEventMap, MiddlewareCreatorConfig> = (
  opts,
  config
) => {
  const { sharer, viewer, calculator, eventHub } = opts;

  let innerConfig = {
    ...defaultStyles,
    ...defaultConfig,
    ...config,
  };
  const styles = getMiddlewareCreatorStyles(innerConfig);
  const rootClassName = getRootClassName();
  let $root: HTMLDivElement | null = null;
  let activeMaterial: Material | null = null;

  const clear = () => {
    sharer.setSharedStorage(keyStartPoint, null); // null | Point;
    sharer.setSharedStorage(keyEndPoint, null); // null | Point;
    activeMaterial = null;
  };
  clear();

  let creative: boolean = false;

  const createCallback = ({ type }: { type: Exclude<MaterialType, 'path' | 'foreignObject' | 'svgCode'> }) => {
    creative = true;
    if ($root) {
      eventHub.trigger(coreEventKeys.CURSOR, {
        type: 'plus',
      });
      sharer.setSharedStorage(keyActiveMaterialType, type);
      addClassName($root, [classNameMap.creative]);
      eventHub.trigger(coreEventKeys.CLEAR_SELECT);
    }
  };

  const clearCreateCallback = () => {
    eventHub.trigger(coreEventKeys.CURSOR, {
      type: 'auto',
    });
    creative = false;
    if ($root) {
      removeClassName($root, [classNameMap.creative]);
    }
  };

  return {
    name: '@middleware/creator',

    use() {
      initStyles(rootClassName, styles);
      $root = initRoot({ rootClassName, $container: opts.container as HTMLElement });

      eventHub.on(coreEventKeys.CREATE, createCallback);
      eventHub.on(coreEventKeys.CLEAR_CREATE, clearCreateCallback);
    },

    disuse() {
      destroyStyles(rootClassName);
      // clear dom
      $root?.remove();
      $root = null;
      eventHub.trigger(coreEventKeys.CURSOR, {
        type: 'auto',
      });
      eventHub.off(coreEventKeys.CREATE, createCallback);
      eventHub.off(coreEventKeys.CLEAR_CREATE, clearCreateCallback);
    },

    resetConfig(config) {
      innerConfig = { ...innerConfig, ...config };
    },

    pointStart: (e) => {
      clear();
      if (!creative) {
        return;
      }
      sharer.setSharedStorage(keyStartPoint, e.point);
    },

    pointMove: (e) => {
      if (!creative) {
        return;
      }
      sharer.setSharedStorage(keyEndPoint, e.point);

      const activeMaterialType = sharer.getSharedStorage(keyActiveMaterialType);
      const start = sharer.getSharedStorage(keyStartPoint);
      const end = sharer.getSharedStorage(keyEndPoint);
      const viewScaleInfo = sharer.getActiveViewScaleInfo();
      const viewSizeInfo = sharer.getActiveViewSizeInfo();
      const data = sharer.getActiveStorage('data');

      if (activeMaterial && start && end) {
        activeMaterial = updateMaterialByArea(activeMaterial, { start, end, viewScaleInfo, calculator });
        updateMaterialInList(activeMaterial.id, activeMaterial, data.materials);
        calculator.modifyVirtualAttributes(activeMaterial, { viewScaleInfo, viewSizeInfo, groupQueue: [] });
      } else if (activeMaterialType && start && end) {
        activeMaterial = createMaterialByArea(activeMaterialType, { start, end, viewScaleInfo, calculator });
        data.materials.push(activeMaterial);
        calculator.resetVirtualItemMap(data, { viewScaleInfo, viewSizeInfo });
      }

      viewer.drawFrame();
    },
    pointEnd: () => {
      if (!creative) {
        return;
      }
      if (activeMaterial) {
        const data = sharer.getActiveStorage('data');
        const modifyRecord: ModifyRecord<'addMaterial'> = {
          type: 'addMaterial',
          time: Date.now(),
          content: {
            method: 'addMaterial',
            id: activeMaterial.id,
            position: [data.materials?.length],
            material: deepClone(activeMaterial),
          },
        };
        triggerChangeEvent(eventHub, { data, type: 'addMaterial', modifyRecord }, 'all');
      }

      if (innerConfig.selectAfterCreated === true && activeMaterial?.id) {
        const id = activeMaterial.id;
        eventHub.trigger(coreEventKeys.SELECT, { ids: [id], type: 'selectMaterial' });
      }

      innerConfig.afterCreated?.();
      clearCreationAreaBox($root);
      clearCreateCallback();
      clear();
    },
    beforeDrawFrame() {
      const start = sharer.getSharedStorage(keyStartPoint);
      const end = sharer.getSharedStorage(keyEndPoint);

      if (start && end) {
        resetCreationAreaBox($root, {
          start,
          end,
        });
      } else {
        clearCreationAreaBox($root);
      }
    },
  };
};
