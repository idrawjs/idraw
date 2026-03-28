import type {
  MaterialSize,
  StrictMaterial,
  ViewScaleInfo,
  HTMLProps,
  ViewCalculator,
  VirtualPathAttributes,
  StylesProps,
  PathAnchorCommand,
  MiddlewarePathEditorStyles,
} from '@idraw/types';
import {
  createHTMLElement,
  limitAngle,
  setHTMLCSSProps,
  scalePathCommands,
  injectStyles,
  removeStyles,
  removeClassName,
  parseHTMLStr,
  convertPathCommandsToStr,
  assembleHTMLElement,
  ATTR_VALID_WATCH,
} from '@idraw/util';
import {
  ATTR_UUID,
  ATTR_X,
  ATTR_Y,
  ATTR_W,
  ATTR_H,
  ATTR_ANGLE,
  ATTR_TYPE,
  ATTR_AHCHOR_CMD_TYPE,
  ATTR_AHCHOR_INDEX,
  ATTR_AHCHOR_ID,
  ATTR_HELPER_TYPE,
  ATTR_DIRECTOR_FROM_AHCHOR_ID,
  ATTR_DIRECTOR_OPENED_BY_AHCHOR_ID,
  ATTR_DIRECTOR_CONTROL_TYPE,
  HELPER_ELEMENT,
  HELPER_GROUP,
  HELPER_ANCHOR,
  HELPER_DIRECTOR,
  HELPER_DIRECTOR_LINE,
  HELPER_PATH_PREVIEW,
  HELPER_PATH_DEFINITION,
  // anchorSize,
  // anchorSelectedSize,
  // anchorBorder,
  // anchorStyle,
  // anchorHoverStyle,
  // anchorActiveStyle,
  // directorSize,
  // directorBorder,
  // directorStyle,
  // directorLineStyle,
  // directorHoverStyle,
  // directorActiveStyle,
  classNameMap,
} from './static';
import type { Directioner, AnchorInfo, DirectorInfo } from './types';
// import { calcVisibleBBoxOfPath } from './calc';

export function initStyles(rootClassName: string, styles: MiddlewarePathEditorStyles) {
  const stylesProps: StylesProps = {
    display: 'flex',
    position: 'absolute',
    zIndex: styles.zIndex,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',

    [`&.${classNameMap.hide}`]: {
      display: 'none',
    },

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

    [`.${classNameMap.director}`]: {
      position: 'absolute',
      width: styles.directorSize,
      height: styles.directorSize,
      background: styles.directorBackground,
      border: `${styles.directorBorderWidth}px solid ${styles.directorBorderColor}`,
      overflow: 'hidden',

      ['&:hover']: {
        borderColor: styles.directorHoverBorderColor,
        background: styles.directorHoverBackground,
      },
      ['&:active']: {
        borderColor: styles.directorActiveBorderColor,
        background: styles.directorActiveBackground,
      },
      [`&.${classNameMap.selected}`]: {
        borderColor: styles.directorActiveBorderColor,
        background: styles.directorActiveBackground,
      },
    },

    [`.${classNameMap.directorLines}`]: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  };
  injectStyles({ styles: stylesProps, rootClassName, type: 'element' });
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

const createBox = (opts: { size: MaterialSize; parent: HTMLDivElement }, props: HTMLProps) => {
  const { size, parent } = opts;
  const { x, y, width, height } = size;
  const angle = limitAngle(size.angle || 0);
  const div = createHTMLElement('div', {
    [ATTR_VALID_WATCH]: 'true',
    style: {
      // ...defaultStyle,
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      transform: `rotate(${angle}deg)`,
    },
    ...props,
  });
  parent.appendChild(div);
  return div;
};

const getBoxMaterialInfo = (box: HTMLElement) => {
  const id = box.getAttribute(ATTR_UUID) || '';
  const type = box.getAttribute(ATTR_TYPE) || '';
  const x = parseFloat(box.getAttribute(ATTR_X) || '0');
  const y = parseFloat(box.getAttribute(ATTR_Y) || '0');
  const w = parseFloat(box.getAttribute(ATTR_W) || '0');
  const h = parseFloat(box.getAttribute(ATTR_H) || '0');
  const angle = parseFloat(box.getAttribute(ATTR_ANGLE) || '0');
  const info = { id, type, x, y, w, h, angle };
  return info;
};

const getAnchorPosition = (opts: { x: number; y: number; size: number; borderWidth: number }) => {
  const { x, y, size, borderWidth } = opts;
  return {
    left: x - size / 2 - borderWidth,
    top: y - size / 2 - borderWidth,
  };
};

const getDirectorPosition = (opts: { x: number; y: number; size: number; borderWidth: number }) => {
  const { x, y, size, borderWidth } = opts;
  return {
    left: x - size / 2 - borderWidth,
    top: y - size / 2 - borderWidth,
  };
};

export const getAnchorHandlerInfo = (handler: HTMLElement) => {
  const id = handler.getAttribute(ATTR_AHCHOR_ID) || '';
  const index = parseFloat(handler.getAttribute(ATTR_AHCHOR_INDEX) || '0');
  const info: AnchorInfo = {
    index,
    id,
  };
  return info;
};

export const getDirectorHandlerInfo = (handler: HTMLElement) => {
  const type = handler.getAttribute(ATTR_DIRECTOR_CONTROL_TYPE) as DirectorInfo['type'];
  const fromAnchorId = handler.getAttribute(ATTR_DIRECTOR_FROM_AHCHOR_ID) || '';
  const openedAnchorId = handler.getAttribute(ATTR_DIRECTOR_OPENED_BY_AHCHOR_ID) || '';
  const info: DirectorInfo = {
    type,
    fromAnchorId,
    openedAnchorId,
  };
  return info;
};

export const resetRoot = (
  root: HTMLElement | null,
  opts: {
    material: StrictMaterial<'path'> | null;
    calculator: ViewCalculator;
    viewScaleInfo: ViewScaleInfo;
    groupQueue: StrictMaterial<'group'>[];
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const { material, calculator, viewScaleInfo, groupQueue, styles } = opts;

  if (!root || !material) {
    return;
  }

  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  if (root?.children) {
    Array.from(root.children).forEach((child) => {
      child.remove();
    });
  }

  removeClassName(root, [classNameMap.hide]);
  let parent = root as HTMLDivElement;
  for (let i = 0; i < groupQueue.length; i++) {
    const group = groupQueue[i];
    const { x, y, width, height } = group;
    const angle = limitAngle(group.angle || 0);
    const size = {
      x: x * scale,
      y: y * scale,
      width: width * scale,
      height: height * scale,
      angle,
    };
    if (i === 0) {
      size.x += offsetLeft;
      size.y += offsetTop;
    }
    parent = createBox(
      { size, parent },
      {
        [ATTR_UUID]: group.id,
        [ATTR_X]: group.x,
        [ATTR_Y]: group.y,
        [ATTR_W]: group.width,
        [ATTR_H]: group.height,
        [ATTR_ANGLE]: group.angle,
        [ATTR_TYPE]: group.type,
        [ATTR_HELPER_TYPE]: HELPER_GROUP,
      }
    );
  }

  let mtrlX = material.x * scale + offsetLeft;
  let mtrlY = material.y * scale + offsetTop;
  let mtrlW = material.width * scale;
  let mtrlH = material.height * scale;

  if (groupQueue.length > 0) {
    mtrlX = material.x * scale;
    mtrlY = material.y * scale;
    mtrlW = material.width * scale;
    mtrlH = material.height * scale;
  }

  const targetBox = createHTMLElement('div', {
    [ATTR_UUID]: material.id,
    [ATTR_X]: material.x,
    [ATTR_Y]: material.y,
    [ATTR_W]: material.width,
    [ATTR_H]: material.height,
    [ATTR_ANGLE]: material.angle,
    [ATTR_TYPE]: material.type,
    [ATTR_HELPER_TYPE]: HELPER_ELEMENT,
    [ATTR_VALID_WATCH]: 'true',
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      position: 'absolute',
      left: mtrlX,
      top: mtrlY,
      width: mtrlW,
      height: mtrlH,
      transform: `rotate(${limitAngle(material.angle || 0)}deg)`,
      boxSizing: 'border-box',
      overflow: 'visible',
      padding: '0',
      margin: '0',
      outline: 'none',
    },
  });

  const flatItem: VirtualPathAttributes = calculator.getVirtualItem(material.id) as VirtualPathAttributes;
  const cmds = scalePathCommands(flatItem.anchorCommands || [], scale, scale);

  cmds.forEach((cmd, i) => {
    const $anchor: HTMLElement = createHTMLElement('div', {
      [ATTR_HELPER_TYPE]: HELPER_ANCHOR,
      [ATTR_AHCHOR_CMD_TYPE]: cmd.type,
      [ATTR_AHCHOR_INDEX]: i,
      [ATTR_AHCHOR_ID]: cmd.id,
      [ATTR_VALID_WATCH]: 'true',
      // [ATTR_X]: cmd.start.x,
      // [ATTR_Y]: cmd.start.y,
      className: classNameMap.anchor,
      style: {
        ...getAnchorPosition({
          x: cmd.start.x,
          y: cmd.start.y,
          size: styles.anchorSize,
          borderWidth: styles.anchorBorderWidth,
        }),
        display: cmd.type === 'M' ? 'none' : 'block',
      },
    });
    targetBox.appendChild($anchor);
  });

  parent.appendChild(targetBox);

  resetPathLine(root, {
    anchorCommands: cmds,
    material,
    viewScaleInfo,
    styles,
  });
};

export const resetAnchorStyle = (
  root: HTMLElement | null,
  opts: {
    selectedAnchorId?: string;
    material: StrictMaterial<'path'> | null;
    viewScaleInfo: ViewScaleInfo;
    calculator: ViewCalculator;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  if (!root) {
    return;
  }

  const { material, viewScaleInfo, calculator, selectedAnchorId, styles } = opts;

  if (!material) {
    return;
  }

  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  let current: SVGElement | HTMLElement | null = root.children[0] as HTMLElement;
  let index = 0;

  while (['group', 'material'].includes(current?.getAttribute(ATTR_HELPER_TYPE) as string)) {
    if (current?.getAttribute(ATTR_HELPER_TYPE) === 'material') {
      setHTMLCSSProps(current, {
        width: material.width,
        height: material.height,
        left: material.x,
        top: material.y,
      });
      assembleHTMLElement(current, {
        [ATTR_W]: material.width,
        [ATTR_H]: material.height,
        [ATTR_X]: material.x,
        [ATTR_Y]: material.y,
      });
    }

    const { x, y, w, h, angle } = getBoxMaterialInfo(current);
    const size = {
      x: x * scale,
      y: y * scale,
      w: w * scale,
      h: h * scale,
      angle,
    };
    if (index === 0) {
      size.x += offsetLeft;
      size.y += offsetTop;
    }
    setHTMLCSSProps(current, {
      left: size.x,
      top: size.y,
      width: size.w,
      height: size.h,
      transform: `rotate(${size.angle}deg)`,
    });
    if (current?.children?.[0]?.getAttribute(ATTR_HELPER_TYPE) !== 'material') {
      break;
    }
    current = current?.children?.[0] as HTMLElement;
    index++;
  }
  const { id } = material as StrictMaterial<'path'>;
  const flatItem: VirtualPathAttributes = calculator.getVirtualItem(id) as VirtualPathAttributes;
  const cmds = scalePathCommands(flatItem.anchorCommands || [], scale, scale);

  {
    // render anchor style
    const $anchors: HTMLElement[] = Array.from(current.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_ANCHOR}"]`));
    $anchors.forEach(($anchor, i) => {
      const cmd = cmds[i];
      const id = $anchor.getAttribute(ATTR_AHCHOR_ID);
      const size = id === selectedAnchorId ? styles.anchorSelectedSize : styles.anchorSize;

      setHTMLCSSProps($anchor, {
        width: size,
        height: size,
        left: cmd.start.x - size / 2 - styles.anchorBorderWidth,
        top: cmd.start.y - size / 2 - styles.anchorBorderWidth,
      });
    });
  }

  // render director style
  if (typeof selectedAnchorId === 'string' && selectedAnchorId) {
    const anchorIndex = cmds.findIndex((cmd) => cmd.id === selectedAnchorId);

    const curveCmd: PathAnchorCommand | undefined = cmds[anchorIndex as number];
    const prevCurveCmd: PathAnchorCommand | undefined = cmds[(anchorIndex as number) - 1];

    let currentDirector: Directioner | null = null;
    let prevDirector: Directioner | null = null;
    if (curveCmd.type === 'C') {
      currentDirector = {
        openedByAnchorId: selectedAnchorId,
        anchorId: curveCmd.id,
        anchorPoint: { x: curveCmd.start.x, y: curveCmd.start.y },
        directPoint: { x: curveCmd.params[0], y: curveCmd.params[1] },
      };
    }

    if (prevCurveCmd.type === 'C') {
      prevDirector = {
        openedByAnchorId: selectedAnchorId,
        anchorId: prevCurveCmd.id,
        anchorPoint: { x: prevCurveCmd.end.x, y: prevCurveCmd.end.y },
        directPoint: { x: prevCurveCmd.params[2], y: prevCurveCmd.params[3] },
      };
    }

    if (currentDirector || prevDirector) {
      resetDirectionerStyle(root, { selectedAnchorId, currentDirector, prevDirector, styles });
      resetDirectorLine(root, { currentDirector, prevDirector, styles });
    } else {
      clearDirectioner(root);
    }
  }

  resetPathPreviewStyle(root, { anchorCommands: cmds, viewScaleInfo, styles });
};

const createDirectorLines = (
  directors: (Directioner | null)[],
  opts: {
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const { styles } = opts;
  const svg = `
    <svg
      width="100%"
      height="100%"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg" 
      ${ATTR_VALID_WATCH}="true"
    >
      ${directors
        .map((director) => {
          if (!director) {
            return '';
          }
          const { anchorPoint, directPoint } = director;
          const x1 = anchorPoint.x;
          const y1 = anchorPoint.y;
          const x2 = directPoint.x;
          const y2 = directPoint.y;
          return `<line 
            x1="${x1}" 
            x2="${x2}" 
            y1="${y1}" 
            y2="${y2}" 
            stroke="${styles.directorLineColor}" 
            stroke-width="2" 
            ${ATTR_VALID_WATCH}="true"
          />`;
        })
        .join('')}
    </svg>
  `;

  const $lines = createHTMLElement(
    'div',
    {
      width: '100%',
      height: '100%',
      className: classNameMap.directorLines,
      [ATTR_HELPER_TYPE]: HELPER_DIRECTOR_LINE,
      [ATTR_VALID_WATCH]: 'true',
    },
    [parseHTMLStr(svg)]
  );
  return $lines;
};

const clearDirectorLine = (root: HTMLElement) => {
  const existedLines = root.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_DIRECTOR_LINE}"]`);
  Array.from(existedLines).forEach((line) => {
    line?.remove();
  });
};

const resetDirectorLine = (
  root: HTMLElement,
  opts: {
    currentDirector: Directioner | null;
    prevDirector: Directioner | null;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const $material = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_ELEMENT}"]`);
  const $pathPreview = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_PATH_PREVIEW}"]`);

  if (!($material && $pathPreview)) {
    return;
  }

  clearDirectorLine(root);
  const { currentDirector, prevDirector, styles } = opts;
  if (prevDirector || currentDirector) {
    const $lines = createDirectorLines([prevDirector, currentDirector], { styles });
    if ($material.firstElementChild) {
      $material.insertBefore($lines, $pathPreview);
    }
  }
};

export const clearDirectioner = (root: HTMLElement | null) => {
  if (!root) {
    return;
  }
  const existedDirectors = root.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_DIRECTOR}"]`);
  Array.from(existedDirectors).forEach((director) => {
    director?.remove();
  });
  clearDirectorLine(root);
};

export const resetDirectionerStyle = (
  root: HTMLElement,
  opts: {
    selectedAnchorId: string;
    currentDirector: Directioner | null;
    prevDirector: Directioner | null;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const { selectedAnchorId, prevDirector, currentDirector, styles } = opts;
  const directors: Directioner[] = [];
  if (prevDirector) {
    directors.push(prevDirector);
  }
  if (currentDirector) {
    directors.push(currentDirector);
  }
  const $directors: HTMLElement[] = Array.from(root.querySelectorAll(`[${ATTR_HELPER_TYPE}="${HELPER_DIRECTOR}"]`));
  let needResetAll = false;
  if (directors.length === $directors.length) {
    for (let i = 0; i < $directors.length; i++) {
      const $director = $directors[i];
      const director = directors[i];
      const info = getDirectorHandlerInfo($directors[i]);
      if (info.openedAnchorId === selectedAnchorId && info.fromAnchorId === director.anchorId) {
        setHTMLCSSProps(
          $director,
          getDirectorPosition({
            x: director.directPoint.x,
            y: director.directPoint.y,
            size: styles.directorSize,
            borderWidth: styles.directorBorderWidth,
          })
        );
      } else {
        needResetAll = true;
        break;
      }
    }
  } else {
    needResetAll = true;
  }
  if (needResetAll) {
    resetDirectioner(root, { prevDirector, currentDirector, styles });
  }
};

const resetDirectioner = (
  root: HTMLElement | null,
  opts: {
    currentDirector: Directioner | null;
    prevDirector: Directioner | null;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  if (!root) {
    return;
  }
  const $material = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_ELEMENT}"]`);
  if (!$material) {
    return;
  }

  clearDirectioner(root);
  resetDirectorLine(root, opts);
  const { currentDirector, prevDirector, styles } = opts;

  if (prevDirector) {
    const $director: HTMLElement = createHTMLElement('div', {
      [ATTR_HELPER_TYPE]: HELPER_DIRECTOR,
      [ATTR_DIRECTOR_CONTROL_TYPE]: 'curve-ctrl2',
      [ATTR_DIRECTOR_FROM_AHCHOR_ID]: prevDirector.anchorId,
      [ATTR_DIRECTOR_OPENED_BY_AHCHOR_ID]: prevDirector.openedByAnchorId,
      // [ATTR_X]: prevDirector.directPoint.x,
      // [ATTR_Y]: prevDirector.directPoint.y,
      [ATTR_VALID_WATCH]: 'true',
      className: classNameMap.director,
      style: {
        ...getDirectorPosition({
          x: prevDirector.directPoint.x,
          y: prevDirector.directPoint.y,
          size: styles.directorSize,
          borderWidth: styles.directorBorderWidth,
        }),
      },
    });
    $material.appendChild($director);
  }
  if (currentDirector) {
    const $director: HTMLElement = createHTMLElement('div', {
      [ATTR_HELPER_TYPE]: HELPER_DIRECTOR,
      [ATTR_DIRECTOR_CONTROL_TYPE]: 'curve-ctrl1',
      [ATTR_DIRECTOR_FROM_AHCHOR_ID]: currentDirector.anchorId,
      [ATTR_DIRECTOR_OPENED_BY_AHCHOR_ID]: currentDirector.openedByAnchorId,
      // [ATTR_X]: currentDirector.directPoint.x,
      // [ATTR_Y]: currentDirector.directPoint.y,
      [ATTR_VALID_WATCH]: 'true',
      className: classNameMap.director,
      style: {
        ...getDirectorPosition({
          x: currentDirector.directPoint.x,
          y: currentDirector.directPoint.y,
          size: styles.directorSize,
          borderWidth: styles.directorBorderWidth,
        }),
      },
    });
    $material.appendChild($director);
  }
};

const resetPathLine = (
  root: HTMLElement,
  opts: {
    anchorCommands: PathAnchorCommand[];
    material: StrictMaterial<'path'> | null;
    viewScaleInfo: ViewScaleInfo;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  if (!root) {
    return;
  }
  const $material = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_ELEMENT}"]`);
  if (!$material) {
    return;
  }

  const $pathPreview = createHTMLElement('div', {
    className: classNameMap.pathLine,
    [ATTR_HELPER_TYPE]: HELPER_PATH_PREVIEW,
    [ATTR_VALID_WATCH]: 'true',
  });

  if ($material.firstElementChild) {
    $material.insertBefore($pathPreview, $material.firstElementChild);
  }
  resetPathPreview(root, opts);
};

const resetPathPreviewStyle = (
  root: HTMLElement,
  opts: {
    anchorCommands: PathAnchorCommand[];
    // material: StrictMaterial<'path'> | null;
    viewScaleInfo: ViewScaleInfo;
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const $pathPreview = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_PATH_PREVIEW}"]`);
  if (!$pathPreview) {
    return;
  }
  const $pathDefinition = $pathPreview.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_PATH_DEFINITION}"]`);
  if ($pathDefinition) {
    const { anchorCommands } = opts;
    const definition = convertPathCommandsToStr(anchorCommands);
    assembleHTMLElement($pathDefinition, {
      d: definition,
    });
  } else {
    resetPathPreview(root, opts);
  }
};

const resetPathPreview = (
  root: HTMLElement,
  opts: {
    viewScaleInfo: ViewScaleInfo;
    anchorCommands: PathAnchorCommand[];
    styles: MiddlewarePathEditorStyles;
  }
) => {
  const $pathPreview = root.querySelector(`[${ATTR_HELPER_TYPE}="${HELPER_PATH_PREVIEW}"]`);
  if (!$pathPreview) {
    return;
  }
  if ($pathPreview?.children) {
    Array.from($pathPreview.children).forEach((child) => {
      child.remove();
    });
  }

  const { anchorCommands, styles } = opts;

  const $svg = parseHTMLStr(`
    <svg 
      width="100%" 
      height="100%" 
      overflow="visible" 
      fill="transparent"
      ${ATTR_VALID_WATCH}="true"
    >
      <path 
        ${ATTR_HELPER_TYPE}="${HELPER_PATH_DEFINITION}" 
        d="${convertPathCommandsToStr(anchorCommands)}" 
        stroke="${styles.helperStrokeColor}"
        stroke-width="${styles.helperStrokeWidth}"
        ${ATTR_VALID_WATCH}="true"
      />
    </svg>
  `);
  assembleHTMLElement($pathPreview, {}, [$svg]);
};

export function calcPathSize(root: HTMLElement | null) {
  // TODO
  if (!root) {
    return null;
  }

  // TODO
}
