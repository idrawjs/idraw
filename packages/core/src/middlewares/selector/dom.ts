import type { RenderMaterialHelperOptions, MaterialSize, Point, Material, StrictMaterial } from '@idraw/types';
import {
  ATTR_VALID_WATCH,
  createHTMLElement,
  calcViewMaterialSize,
  assembleHTMLElement,
  addClassName,
  removeClassName,
  getMaterialSize,
  calcMaterialListSize,
  calcViewPoint,
  setHTMLCSSProps,
  bubbleHTMLElement,
} from '@idraw/util';
import {
  classNameMap,
  ATTR_BOX_TYPE,
  ATTR_MATERIAL_ID,
  ATTR_HANDLER_TYPE,
  BOX_TARGET,
  BOX_GROUP,
  cornerHandlerSize,
} from './static';

type StrictMaterialSize = Required<MaterialSize>;

function createNestedBox(opts: {
  viewMaterialSize: StrictMaterialSize | null;
  viewGroupSizeQueue: StrictMaterialSize[];
  className: string;
  targetClassName: string;
}) {
  const { viewMaterialSize, viewGroupSizeQueue, className, targetClassName } = opts;
  let $target: HTMLDivElement | null = null;
  if (viewMaterialSize) {
    $target = createHTMLElement('div', {
      [ATTR_BOX_TYPE]: BOX_TARGET,
      [ATTR_VALID_WATCH]: 'true',
      [ATTR_MATERIAL_ID]: viewMaterialSize.id,
      className: classNameMap.materialBox,
      style: {
        display: 'block',
        position: 'absolute',
        top: viewMaterialSize.y,
        left: viewMaterialSize.x,
        width: viewMaterialSize.width,
        height: viewMaterialSize.height,
        transform: `rotate(${viewMaterialSize.angle || 0}deg)`,
      },
    });
    addClassName($target, [targetClassName]);
  }

  let $result = $target;
  for (let i = viewGroupSizeQueue.length - 1; i >= 0; i--) {
    const groupSize = viewGroupSizeQueue[i];
    const children = [];
    if ($result) {
      children.push($result);
    }

    $result = createHTMLElement(
      'div',
      {
        [ATTR_BOX_TYPE]: BOX_GROUP,
        [ATTR_VALID_WATCH]: 'true',
        [ATTR_MATERIAL_ID]: groupSize.id,
        className: `${classNameMap.materialBox} ${classNameMap.groupBox}`,
        style: {
          position: 'absolute',
          top: groupSize.y,
          left: groupSize.x,
          width: groupSize.width,
          height: groupSize.height,
          transform: `rotate(${groupSize.angle || 0}deg)`,
        },
      },
      children
    );
  }
  if ($result) {
    addClassName($result, [className]);
  }

  return $result;
}

function calcBoxSizes(opts: RenderMaterialHelperOptions): {
  viewMaterialSize: StrictMaterialSize | null;
  viewGroupSizeQueue: StrictMaterialSize[];
} {
  const { material, groupQueue, viewScaleInfo } = opts;

  let viewMaterialSize = material ? getMaterialSize(material) : null;
  const viewGroupSizeQueue = groupQueue.map((group) => getMaterialSize(group));

  if (Array.isArray(viewGroupSizeQueue) && viewGroupSizeQueue.length > 0) {
    viewMaterialSize = viewMaterialSize
      ? calcViewMaterialSize(viewMaterialSize, { viewScaleInfo: { scale: viewScaleInfo.scale } })
      : null;
    viewGroupSizeQueue[0] = calcViewMaterialSize(viewGroupSizeQueue[0], { viewScaleInfo });
    for (let i = 1; i < viewGroupSizeQueue.length; i++) {
      viewGroupSizeQueue[i] = calcViewMaterialSize(viewGroupSizeQueue[i], {
        viewScaleInfo: { scale: viewScaleInfo.scale },
      });
    }
  } else {
    viewMaterialSize = viewMaterialSize ? calcViewMaterialSize(viewMaterialSize, { viewScaleInfo }) : null;
  }
  return {
    viewMaterialSize: viewMaterialSize as StrictMaterialSize | null,
    viewGroupSizeQueue: viewGroupSizeQueue as StrictMaterialSize[],
  };
}

function generateBoxsBySizes(
  $root: HTMLDivElement | null,
  opts: {
    viewMaterialSize: StrictMaterialSize | null;
    viewGroupSizeQueue: StrictMaterialSize[];
    className: string;
    targetClassName: string;
  }
) {
  if (!$root) {
    return null;
  }
  const { className, targetClassName, viewMaterialSize, viewGroupSizeQueue } = opts;
  const $box = createNestedBox({
    viewMaterialSize,
    viewGroupSizeQueue,
    className,
    targetClassName,
  });

  if ($box) {
    assembleHTMLElement($root, {}, [$box]);
  }
  return $box;
}

function generateBoxs(
  $root: HTMLDivElement | null,
  opts: RenderMaterialHelperOptions & {
    className: string;
    targetClassName: string;
  }
) {
  if (!$root) {
    return null;
  }
  const { className, targetClassName } = opts;
  const { viewMaterialSize, viewGroupSizeQueue } = calcBoxSizes(opts);
  return generateBoxsBySizes($root, {
    viewMaterialSize,
    viewGroupSizeQueue,
    className,
    targetClassName,
  });
}

function resetBoxs(
  $root: HTMLDivElement | null,
  opts: RenderMaterialHelperOptions & {
    className: string;
    targetClassName: string;
    renderTargetInner?: ($target: HTMLElement) => void;
    destoryTargetInner?: ($target: HTMLElement) => void;
    afterRender?: (opts: {
      $rootBox: HTMLElement | null;
      viewMaterialSize: Required<MaterialSize> | null;
      viewGroupSizeQueue: Required<MaterialSize>[];
    }) => void;
  }
) {
  if (!$root) {
    return null;
  }
  const { className, targetClassName, renderTargetInner, destoryTargetInner, afterRender } = opts;
  const $boxs = $root.getElementsByClassName(className);
  const { viewMaterialSize, viewGroupSizeQueue } = calcBoxSizes(opts);
  const remove = () => {
    Array.from($boxs).forEach(($box) => {
      $box.remove();
    });
  };

  if (!viewMaterialSize && !viewGroupSizeQueue.length) {
    remove();
  }

  if ($boxs.length === 1) {
    const $box = $boxs[0] as HTMLDivElement;
    addClassName($box, [className]);

    if (viewGroupSizeQueue.length > 0) {
      let index = 0;
      let $current: HTMLDivElement | undefined = $boxs[0] as HTMLDivElement;
      let $parent: HTMLElement | null = $current.parentElement;

      while (index < viewGroupSizeQueue.length) {
        const groupSize = viewGroupSizeQueue[index];

        if ($current) {
          removeClassName($current as HTMLDivElement, [targetClassName]);
          assembleHTMLElement($current, {
            [ATTR_BOX_TYPE]: BOX_GROUP,
            [ATTR_VALID_WATCH]: 'true',
            [ATTR_MATERIAL_ID]: groupSize.id,
            style: {
              position: 'absolute',
              top: groupSize.y,
              left: groupSize.x,
              width: groupSize.width,
              height: groupSize.height,
              transform: `rotate(${groupSize.angle || 0}deg)`,
            },
          });
        } else {
          $current = createHTMLElement('div', {
            [ATTR_BOX_TYPE]: BOX_GROUP,
            [ATTR_VALID_WATCH]: 'true',
            [ATTR_MATERIAL_ID]: groupSize.id,
            className: `${classNameMap.materialBox} ${classNameMap.groupBox}`,
            style: {
              position: 'absolute',
              top: groupSize.y,
              left: groupSize.x,
              width: groupSize.width,
              height: groupSize.height,
              transform: `rotate(${groupSize.angle || 0}deg)`,
            },
          });
          $parent?.appendChild($current);
        }
        $parent = $current;
        if (index + 1 === viewGroupSizeQueue.length) {
          // TODO
          break;
        }

        // next
        $current = $current?.children?.[0] as HTMLDivElement | undefined;
        index++;
      }

      if (viewMaterialSize) {
        let $target: HTMLElement | undefined = $current?.children?.[0] as HTMLElement | undefined;
        if (!$target) {
          $target = createHTMLElement('div');
          $parent?.appendChild($target);
        }

        assembleHTMLElement($target as HTMLDivElement, {
          [ATTR_BOX_TYPE]: BOX_TARGET,
          [ATTR_VALID_WATCH]: 'true',
          [ATTR_MATERIAL_ID]: viewMaterialSize.id,
          // className: classNameMap.materialBox,
          style: {
            display: 'block',
            position: 'absolute',
            top: viewMaterialSize.y,
            left: viewMaterialSize.x,
            width: viewMaterialSize.width,
            height: viewMaterialSize.height,
            transform: `rotate(${viewMaterialSize.angle || 0}deg)`,
          },
        });
        renderTargetInner?.($target);
      } else {
        destoryTargetInner?.($current as HTMLDivElement);
      }
    } else {
      if (viewMaterialSize) {
        destoryTargetInner?.($box);
        assembleHTMLElement($box, {
          [ATTR_BOX_TYPE]: BOX_TARGET,
          [ATTR_VALID_WATCH]: 'true',
          [ATTR_MATERIAL_ID]: viewMaterialSize.id,
          style: {
            display: 'block',
            position: 'absolute',
            top: viewMaterialSize.y,
            left: viewMaterialSize.x,
            width: viewMaterialSize.width,
            height: viewMaterialSize.height,
            transform: `rotate(${viewMaterialSize.angle || 0}deg)`,
          },
        });
        addClassName($box, [targetClassName]);
        renderTargetInner?.($box);
      } else {
        remove();
      }
    }
    afterRender?.({ $rootBox: $box, viewGroupSizeQueue, viewMaterialSize });
    return $box;
  } else {
    remove();
    const $box = generateBoxsBySizes($root, {
      viewMaterialSize,
      viewGroupSizeQueue,
      className,
      targetClassName,
    }) as HTMLDivElement;
    addClassName($box, [targetClassName]);
    renderTargetInner?.($box);
    afterRender?.({ $rootBox: $box, viewGroupSizeQueue, viewMaterialSize });
  }
}

function destroyBoxs($root: HTMLDivElement | null, opts: { className: string }) {
  if (!$root) {
    return;
  }
  const { className } = opts;
  // clear existed hover box
  const $prevBoxs = Array.from($root.getElementsByClassName(className));
  $prevBoxs.forEach(($box) => {
    $box.remove();
  });
}

export function initRoot(opts: { rootClassName: string; $container: HTMLElement }) {
  const { rootClassName, $container } = opts;
  const create = createHTMLElement;

  const $root = create('div', {
    className: rootClassName,
    [ATTR_VALID_WATCH]: 'true',
  });
  $container.appendChild($root);
  return $root;
}

// nested box for in-group
function clearMaterialNestedBox($root: HTMLDivElement | null) {
  return destroyBoxs($root, { className: classNameMap.nestedBox });
}
export function resetMaterialNestedBox($root: HTMLDivElement | null, opts: RenderMaterialHelperOptions) {
  const { groupQueue } = opts;
  if (Array.isArray(groupQueue) && groupQueue.length) {
    resetBoxs($root, {
      ...opts,
      className: classNameMap.nestedBox,
      targetClassName: classNameMap.nestedTargetBox,
    });
  } else {
    clearMaterialNestedBox($root);
  }
}

// Hover
export function clearMaterialHoverBox($root: HTMLDivElement | null) {
  return destroyBoxs($root, { className: classNameMap.hoverBox });
}

export function renderMaterialHoverBox($root: HTMLDivElement | null, opts: RenderMaterialHelperOptions) {
  clearMaterialHoverBox($root);
  resetBoxs($root, {
    ...opts,
    className: classNameMap.hoverBox,
    targetClassName: classNameMap.hoverTargetBox,
  });
}

// Locked
export function clearMaterialLockedBox($root: HTMLDivElement | null) {
  return destroyBoxs($root, { className: classNameMap.lockedBox });
}

export function renderMaterialLockedBox($root: HTMLDivElement | null, opts: RenderMaterialHelperOptions) {
  clearMaterialLockedBox($root);
  generateBoxs($root, {
    ...opts,
    className: classNameMap.lockedBox,
    targetClassName: classNameMap.lockedTargetBox,
  });
}

// selected
function clearMaterialSelectedBox($root: HTMLDivElement | null) {
  return destroyBoxs($root, { className: classNameMap.selectedBox });
}
function renderSelectedBoxInnerHandlers($target: HTMLElement) {
  const $existHandlers = $target.querySelectorAll(`[${ATTR_HANDLER_TYPE}]`);
  if ($existHandlers.length > 0) {
    return;
  }

  const create = createHTMLElement;
  const baseAttrs = {
    [ATTR_VALID_WATCH]: 'true',
  };

  assembleHTMLElement($target, {}, [
    create('div', {
      [ATTR_HANDLER_TYPE]: 'left',
      ...baseAttrs,
      className: `${classNameMap.edgeHandler} ${classNameMap.edgeLeftHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'top',
      ...baseAttrs,
      className: `${classNameMap.edgeHandler} ${classNameMap.edgeTopHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'right',
      ...baseAttrs,
      className: `${classNameMap.edgeHandler} ${classNameMap.edgeRightHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'bottom',
      ...baseAttrs,
      className: `${classNameMap.edgeHandler} ${classNameMap.edgeBottomHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'top-left',
      ...baseAttrs,
      className: `${classNameMap.cornerHandler} ${classNameMap.cornerTopLeftHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'top-right',
      ...baseAttrs,
      className: `${classNameMap.cornerHandler} ${classNameMap.cornerTopRightHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'bottom-left',
      ...baseAttrs,
      className: `${classNameMap.cornerHandler} ${classNameMap.cornerBottomLeftHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'bottom-right',
      ...baseAttrs,
      className: `${classNameMap.cornerHandler} ${classNameMap.cornerBottomRightHandler}`,
    }),
    create('div', {
      [ATTR_HANDLER_TYPE]: 'rotate',
      ...baseAttrs,
      className: classNameMap.rotateHandler,
    }),
  ]);
}
export function resetMaterialSelectedBox($root: HTMLDivElement | null, opts: RenderMaterialHelperOptions) {
  const { material } = opts;

  if (material) {
    resetBoxs($root, {
      ...opts,
      className: classNameMap.selectedBox,
      targetClassName: classNameMap.selectedTargetBox,
      renderTargetInner: renderSelectedBoxInnerHandlers,
      destoryTargetInner: ($target) => ($target.innerHTML = ''),
      afterRender: ({ $rootBox, viewMaterialSize }) => {
        if (viewMaterialSize && $rootBox) {
          const { width, height } = viewMaterialSize;
          const size = Math.min(width, height);
          if (size > cornerHandlerSize * 4) {
            removeClassName($rootBox, [classNameMap.hideHandler]);
          } else {
            addClassName($rootBox, [classNameMap.hideHandler]);
          }
        }
      },
    });
  } else {
    clearMaterialSelectedBox($root);
  }
}

// selection area
export function clearMaterialSelectionAreaBox($root: HTMLDivElement | null) {
  return destroyBoxs($root, { className: classNameMap.selectionAreaBox });
}
function getSelectionAreaBox($root: HTMLDivElement) {
  const $boxs = $root.getElementsByClassName(classNameMap.selectionAreaBox);
  if ($boxs[0]) {
    return $boxs[0] as HTMLElement;
  }
  const $box = createHTMLElement('div', { [ATTR_VALID_WATCH]: 'true', className: classNameMap.selectionAreaBox });
  assembleHTMLElement($root, {}, [$box]);
  return $box as HTMLElement;
}
export function resetMaterialSelectionAreaBox(
  $root: HTMLDivElement | null,
  opts: RenderMaterialHelperOptions & {
    areaStart: Point | null;
    areaEnd: Point | null;
    selectedMaterials: Material[];
  }
) {
  if (!$root) {
    return;
  }

  const { areaStart, areaEnd, selectedMaterials, viewScaleInfo } = opts;
  let start: Point | null = null;
  let end: Point | null = null;
  let needCalcInView = false;
  if (selectedMaterials.length > 1 || (selectedMaterials.length === 1 && areaStart && areaEnd)) {
    const listSize = calcMaterialListSize(selectedMaterials);
    const { x, y, width, height } = listSize;
    start = { x, y };
    end = {
      x: x + width,
      y: y + height,
    };
    needCalcInView = true;
  } else if (areaStart && areaEnd) {
    start = { ...areaStart };
    end = { ...areaEnd };
  }
  if (start && end) {
    const $box = getSelectionAreaBox($root);
    if (needCalcInView) {
      start = calcViewPoint(start, { viewScaleInfo });
      end = calcViewPoint(end, { viewScaleInfo });
    }

    setHTMLCSSProps($box, {
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    });
  } else {
    clearMaterialSelectionAreaBox($root);
  }
}

export function isPointInActiveGroup(
  e: Event,
  opts: {
    $root: HTMLElement | null;
    groupQueue: StrictMaterial<'group'>[] | null;
  }
): boolean {
  const { groupQueue, $root } = opts;
  if (!groupQueue || !(groupQueue?.length > 0) || !$root) {
    return false;
  }
  const id = groupQueue[groupQueue.length - 1].id;
  const $target = e.target as HTMLElement;
  if (typeof id === 'string' && id) {
    if ($target?.getAttribute(ATTR_BOX_TYPE) === BOX_GROUP && $target?.getAttribute(ATTR_MATERIAL_ID) === id) {
      return true;
    }
    const $targetGroup = bubbleHTMLElement($target, $root, {
      [ATTR_BOX_TYPE]: BOX_GROUP,
    });
    if (
      $targetGroup?.getAttribute(ATTR_BOX_TYPE) === BOX_GROUP &&
      $targetGroup?.getAttribute(ATTR_MATERIAL_ID) === id
    ) {
      return true;
    }
  }
  return false;
}
