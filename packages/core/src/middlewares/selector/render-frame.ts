import type {
  Data,
  StrictMaterial,
  Material,
  RenderMaterialHelperOptions,
  BoardViewerFrameSnapshot,
  BoardMiddlewareOptions,
  MiddlewareSelectorStyles,
} from '@idraw/types';
import type { Point, ActionType, DeepSelectorSharedStorage } from './types';
import { drawReferenceLines } from './draw-reference';
import { calcSelectedMaterialsArea } from './util';
import {
  // legacy
  keyActionType,
  keyResizeType,
  keyAreaStart,
  keyAreaEnd,
  keyGroupQueue,
  keyHoverMaterial,
  keySelectedMaterialList,
  keyEnableSnapToGrid,
} from './static';
import { calcReferenceInfo } from './reference';
import {
  renderMaterialHoverBox,
  clearMaterialHoverBox,
  renderMaterialLockedBox,
  clearMaterialLockedBox,
  resetMaterialNestedBox,
  resetMaterialSelectedBox,
  resetMaterialSelectionAreaBox,
} from './dom';

export { keySelectedMaterialList, keyHoverMaterial, keyActionType, keyResizeType, keyGroupQueue };
export type { DeepSelectorSharedStorage, ActionType };

export type RenderFrameOptions = Pick<
  BoardMiddlewareOptions<DeepSelectorSharedStorage>,
  'sharer' | 'calculator' | 'boardContent'
> & {
  snapshot: BoardViewerFrameSnapshot<DeepSelectorSharedStorage>;
  $root: HTMLDivElement | null;
  styles: MiddlewareSelectorStyles;
};

export function renderFrame({ $root, styles, snapshot, sharer, calculator, boardContent }: RenderFrameOptions) {
  const { activeStore, sharedStore } = snapshot;
  const { overlayContext } = boardContent;
  const {
    scale,
    offsetLeft,
    offsetTop,
    offsetRight,
    offsetBottom,
    width,
    height,
    contextHeight,
    contextWidth,
    devicePixelRatio,
  } = activeStore;

  const viewScaleInfo = { scale, offsetLeft, offsetTop, offsetRight, offsetBottom };
  const viewSizeInfo = { width, height, contextHeight, contextWidth, devicePixelRatio };
  const selectedMaterials = sharedStore[keySelectedMaterialList];
  const mtrl = selectedMaterials[0];
  const hoverMaterial: Material = sharedStore[keyHoverMaterial] as Material;
  const actionType: ActionType = sharedStore[keyActionType] as ActionType;
  const areaStart: Point | null = sharedStore[keyAreaStart];
  const areaEnd: Point | null = sharedStore[keyAreaEnd];
  const groupQueue: StrictMaterial<'group'>[] = sharedStore[keyGroupQueue];
  const enableSnapToGrid = sharedStore[keyEnableSnapToGrid];

  const isHoverLocked: boolean = !!hoverMaterial?.operations?.locked;

  const helperOpts: RenderMaterialHelperOptions = {
    material: null,
    groupQueue: groupQueue || [],
    viewScaleInfo,
    viewSizeInfo,
    calculator,
  };
  resetMaterialNestedBox($root, helperOpts);

  clearMaterialHoverBox($root);
  clearMaterialLockedBox($root);
  if (hoverMaterial && hoverMaterial?.id !== selectedMaterials[0]?.id) {
    // hover
    helperOpts.material = hoverMaterial;
    if (isHoverLocked) {
      renderMaterialLockedBox($root, helperOpts);
    } else {
      renderMaterialHoverBox($root, helperOpts);
    }
  }

  // seleced
  resetMaterialSelectedBox($root, {
    ...helperOpts,
    material: selectedMaterials.length === 1 ? selectedMaterials[0] : null,
  });

  // selected area
  resetMaterialSelectionAreaBox($root, {
    ...helperOpts,
    areaStart,
    areaEnd,
    selectedMaterials,
  });

  // legacy logic
  if (groupQueue?.length > 0) {
    // in group

    if (mtrl && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
      if (actionType === 'drag') {
        if (enableSnapToGrid === true) {
          const referenceInfo = calcReferenceInfo(mtrl.id, {
            calculator,
            data: activeStore.data as Data,
            groupQueue,
            viewScaleInfo,
            viewSizeInfo,
          });
          if (referenceInfo) {
            const { offsetX, offsetY, xLines, yLines } = referenceInfo;
            if (offsetX === 0 || offsetY === 0) {
              drawReferenceLines(overlayContext, {
                xLines,
                yLines,
                styles,
              });
            }
          }
        }
      }
    }
  } else {
    // in root
    if (mtrl && (['select', 'drag', 'resize'] as ActionType[]).includes(actionType)) {
      if (actionType === 'drag') {
        if (enableSnapToGrid === true) {
          const referenceInfo = calcReferenceInfo(mtrl.id, {
            calculator,
            data: activeStore.data as Data,
            groupQueue,
            viewScaleInfo,
            viewSizeInfo,
          });
          if (referenceInfo) {
            const { offsetX, offsetY, xLines, yLines } = referenceInfo;
            if (offsetX === 0 || offsetY === 0) {
              drawReferenceLines(overlayContext, {
                xLines,
                yLines,
                styles,
              });
            }
          }
        }
      }
    } else if (actionType === 'area' && areaStart && areaEnd) {
      // drawArea(overlayContext, { start: areaStart, end: areaEnd, style });
    } else if ((['drag-list', 'drag-list-end'] as ActionType[]).includes(actionType)) {
      const listAreaSize = calcSelectedMaterialsArea(sharer.getSharedStorage(keySelectedMaterialList), {
        viewScaleInfo: sharer.getActiveViewScaleInfo(),
        viewSizeInfo: sharer.getActiveViewSizeInfo(),
        calculator,
      });
      if (listAreaSize) {
        // drawListArea(overlayContext, { areaSize: listAreaSize, style });
      }
    }
  }
}
