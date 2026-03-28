import type { ViewScaleInfo, DataLayout, HTMLCSSProps } from '@idraw/types';
import {
  ATTR_VALID_WATCH,
  createHTMLElement,
  assembleHTMLElement,
  calcViewMaterialSize,
  setHTMLCSSProps,
  addClassName,
  removeClassName,
} from '@idraw/util';
import { classNameMap, ATTR_HANDLER_TYPE } from './static';

type Options = { viewScaleInfo: ViewScaleInfo; layout?: DataLayout; rootClassName: string; hover: boolean };

export function clearMaterialLayoutBoxs($container: HTMLDivElement, opts: Pick<Options, 'rootClassName'>) {
  const { rootClassName } = opts;
  const $boxs = $container.getElementsByClassName(rootClassName);
  Array.from($boxs).forEach(($box) => {
    $box.remove();
  });
}

function renderLayoutBoxHandlers($container: HTMLElement, opts: Options) {
  const $existHandlers = $container.querySelectorAll(`[${ATTR_HANDLER_TYPE}]`);
  const { rootClassName, layout, viewScaleInfo, hover } = opts;
  if (!layout) {
    return;
  }

  const layoutSize = calcViewMaterialSize(layout, { viewScaleInfo });
  const { x, y, height, width } = layoutSize;
  const edgeLeftStyle: HTMLCSSProps = {
    left: x,
    top: y,
    height,
  };
  const edgeTopStyle: HTMLCSSProps = {
    left: x,
    top: y,
    width,
  };
  const edgeRightStyle: HTMLCSSProps = {
    left: x + width,
    top: y,
    height,
  };
  const edgeBottomStyle: HTMLCSSProps = {
    left: x,
    top: y + height,
    width,
  };

  const cornerTopLeftStyle: HTMLCSSProps = {
    left: x,
    top: y,
  };
  const cornerTopRightStyle: HTMLCSSProps = {
    left: x + width,
    top: y,
  };
  const cornerBottomLeftStyle: HTMLCSSProps = {
    left: x,
    top: y + height,
  };
  const cornerBottomRightStyle: HTMLCSSProps = {
    left: x + width,
    top: y + height,
  };

  if ($existHandlers.length > 0) {
    const $edgeLeft = $container.getElementsByClassName(classNameMap.edgeLeftHandler)[0] as HTMLElement;
    const $edgeRight = $container.getElementsByClassName(classNameMap.edgeRightHandler)[0] as HTMLElement;
    const $edgeTop = $container.getElementsByClassName(classNameMap.edgeTopHandler)[0] as HTMLElement;
    const $edgeBottom = $container.getElementsByClassName(classNameMap.edgeBottomHandler)[0] as HTMLElement;

    const $cornerTopLeft = $container.getElementsByClassName(classNameMap.cornerTopLeftHandler)[0] as HTMLElement;
    const $cornerTopRight = $container.getElementsByClassName(classNameMap.cornerTopRightHandler)[0] as HTMLElement;
    const $cornerBottomLeft = $container.getElementsByClassName(classNameMap.cornerBottomLeftHandler)[0] as HTMLElement;
    const $cornerBottomRight = $container.getElementsByClassName(
      classNameMap.cornerBottomRightHandler
    )[0] as HTMLElement;

    setHTMLCSSProps($edgeLeft, edgeLeftStyle);
    setHTMLCSSProps($edgeRight, edgeRightStyle);
    setHTMLCSSProps($edgeTop, edgeTopStyle);
    setHTMLCSSProps($edgeBottom, edgeBottomStyle);

    setHTMLCSSProps($cornerTopLeft, cornerTopLeftStyle);
    setHTMLCSSProps($cornerTopRight, cornerTopRightStyle);
    setHTMLCSSProps($cornerBottomLeft, cornerBottomLeftStyle);
    setHTMLCSSProps($cornerBottomRight, cornerBottomRightStyle);
  } else {
    const create = createHTMLElement;
    const baseAttrs = {
      [ATTR_VALID_WATCH]: 'true',
    };

    assembleHTMLElement($container, {}, [
      create('div', {
        [ATTR_HANDLER_TYPE]: 'left',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.edgeHandler} ${classNameMap.edgeLeftHandler}`,
        style: edgeLeftStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'top',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.edgeHandler} ${classNameMap.edgeTopHandler}`,
        style: edgeTopStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'right',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.edgeHandler} ${classNameMap.edgeRightHandler}`,
        style: edgeRightStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'bottom',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.edgeHandler} ${classNameMap.edgeBottomHandler}`,
        style: edgeBottomStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'top-left',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.cornerHandler} ${classNameMap.cornerTopLeftHandler}`,
        style: cornerTopLeftStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'top-right',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.cornerHandler} ${classNameMap.cornerTopRightHandler}`,
        style: cornerTopRightStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'bottom-left',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.cornerHandler} ${classNameMap.cornerBottomLeftHandler}`,
        style: cornerBottomLeftStyle,
      }),
      create('div', {
        [ATTR_HANDLER_TYPE]: 'bottom-right',
        ...baseAttrs,
        className: `${rootClassName} ${classNameMap.cornerHandler} ${classNameMap.cornerBottomRightHandler}`,
        style: cornerBottomRightStyle,
      }),
    ]);
  }

  const $handlers = Array.from($container.querySelectorAll(`[${ATTR_HANDLER_TYPE}]`)) as HTMLElement[];
  if (hover) {
    $handlers.forEach(($item) => {
      addClassName($item, [classNameMap.hover]);
    });
  } else {
    $handlers.forEach(($item) => {
      removeClassName($item, [classNameMap.hover]);
    });
  }
}
export function resetMaterialSelectedBox($contaier: HTMLDivElement, opts: Options) {
  const { layout } = opts;
  if (layout) {
    renderLayoutBoxHandlers($contaier, opts);
  } else {
    clearMaterialLayoutBoxs($contaier, opts);
  }
}
