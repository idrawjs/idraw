import type { StylesProps, Point, ViewScaleInfo, MiddlewarePathCreatorStyles } from '@idraw/types';
import {
  injectStyles,
  removeStyles,
  createHTMLElement,
  setHTMLCSSProps,
  createId,
  calcViewPoint,
  ATTR_VALID_WATCH,
} from '@idraw/util';
import {
  ATTR_X,
  ATTR_Y,
  ATTR_AHCHOR_CMD_TYPE,
  ATTR_AHCHOR_INDEX,
  ATTR_AHCHOR_ID,
  ATTR_HELPER_TYPE,
  HELPER_ANCHOR,
  classNameMap,
} from './static';

export function initStyles(rootClassName: string, styles: MiddlewarePathCreatorStyles) {
  const stylesProps: StylesProps = {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',

    [`.${classNameMap.anchor}`]: {
      position: 'absolute',
      width: styles.anchorSize,
      height: styles.anchorSize,
      background: styles.anchorBackground,
      border: `${styles.anchorBorderWidth}px solid ${styles.anchorBorderColor}`,
      borderRadius: '50%',
      overflow: 'hidden',

      ['&:hover']: {
        borderColor: styles.anchorHoverBorderColor,
        background: styles.anchorHoverBackground,
      },
      ['&:active']: {
        borderColor: styles.anchorActiveBorderColor,
        background: styles.anchorActiveBackground,
      },
      [`&.${classNameMap.selected}`]: {
        borderColor: styles.anchorActiveBorderColor,
        background: styles.anchorActiveBackground,
      },
    },
  };
  injectStyles({
    styles: stylesProps,
    rootClassName,
    type: 'element',
  });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

export function initRoot(container: HTMLElement, opts: { id: string; rootClassName: string }) {
  const { id, rootClassName } = opts;

  if (!container) {
    return;
  }
  const root = createHTMLElement('div', {
    id,
    className: [classNameMap.hide, rootClassName].join(' '),
    [ATTR_VALID_WATCH]: 'true',
  });
  if (!container.contains(root)) {
    container.appendChild(root);
  }
  return root;
}

const getAnchorPosition = (opts: { x: number; y: number; size: number; borderWidth: number }) => {
  const { x, y, size, borderWidth } = opts;
  return {
    left: x - size / 2 - borderWidth,
    top: y - size / 2 - borderWidth,
  };
};

export function createAnchorElement(opts: {
  id: string;
  index: number;
  point: Point;
  commandType: string;
  viewScaleInfo: ViewScaleInfo;
  styles: MiddlewarePathCreatorStyles;
}) {
  const { id, index, point, commandType, viewScaleInfo, styles } = opts;
  const viewPoint = calcViewPoint(point, { viewScaleInfo });
  const $anchor: HTMLElement = createHTMLElement('div', {
    [ATTR_HELPER_TYPE]: HELPER_ANCHOR,
    [ATTR_AHCHOR_CMD_TYPE]: commandType,
    [ATTR_AHCHOR_INDEX]: index,
    [ATTR_AHCHOR_ID]: id,
    [ATTR_VALID_WATCH]: 'true',
    [ATTR_X]: point.x,
    [ATTR_Y]: point.y,
    className: classNameMap.anchor,
    style: {
      ...getAnchorPosition({
        x: viewPoint.x,
        y: viewPoint.y,
        size: styles.anchorSize,
        borderWidth: styles.anchorBorderWidth,
      }),
      display: 'block',
    },
  });
  return $anchor;
}

export function appendAnchorElement(
  root: HTMLElement,
  opts: {
    point: Point;
    viewScaleInfo: ViewScaleInfo;
    styles: MiddlewarePathCreatorStyles;
  }
) {
  const { point, viewScaleInfo, styles } = opts;
  const $existedAnchors = Array.from(root.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_ANCHOR}"]`));
  const index = $existedAnchors.length;
  const id = createId();
  const $anchor = createAnchorElement({
    index,
    id,
    point,
    styles,
    viewScaleInfo,
    commandType: index === 0 ? 'M' : 'C',
  });
  if (index === 0) {
    root.appendChild($anchor);
  } else {
    const $lastAnchor = $existedAnchors[$existedAnchors.length - 1];
    $lastAnchor.after($anchor);
  }
  return { id };
}

const getAnchorElementInfo = (elem: HTMLElement) => {
  const id = elem.getAttribute(ATTR_AHCHOR_ID) || '';
  const type = elem.getAttribute(ATTR_HELPER_TYPE) || '';
  const x = parseFloat(elem.getAttribute(ATTR_X) || '0');
  const y = parseFloat(elem.getAttribute(ATTR_Y) || '0');
  const info = { id, type, x, y };
  return info;
};

export function updateAnchorsStyle(
  root: HTMLDivElement,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    styles: MiddlewarePathCreatorStyles;
  }
) {
  const { viewScaleInfo, styles } = opts;
  const $anchors = Array.from(root.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_ANCHOR}"]`)) as HTMLElement[];
  $anchors.forEach(($anchor) => {
    const info = getAnchorElementInfo($anchor);
    const viewPoint = calcViewPoint({ x: info.x, y: info.y }, { viewScaleInfo });
    setHTMLCSSProps(
      $anchor,
      getAnchorPosition({
        ...viewPoint,
        size: styles.anchorSize,
        borderWidth: styles.anchorBorderWidth,
      })
    );
  });
}

export function isAnchorElement(elem: HTMLElement) {
  return elem.getAttribute(ATTR_HELPER_TYPE) === HELPER_ANCHOR;
}

export function getIndexFromAnchorElement(elem: HTMLElement): number | null {
  const index = elem.getAttribute(ATTR_AHCHOR_INDEX);
  if (typeof index === 'string') {
    return parseInt(index);
  }
  return index;
}

export function clearRoot(root: HTMLElement | null) {
  if (!root) {
    return;
  }
  const children = Array.from(root.children);
  children.forEach((child) => {
    child.remove();
  });
}
