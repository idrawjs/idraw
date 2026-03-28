import type { HTMLCSSProps, MiddlewareTextEditorStyles, MaterialSize } from '@idraw/types';
import {
  injectStyles,
  removeStyles,
  setHTMLCSSProps,
  limitAngle,
  getDefaultMaterialAttributes,
  enhanceFontFamliy,
} from '@idraw/util';
import { classNameMap } from './static';
import type { InnerOptions } from './types';

const defaultMaterialAttributes = getDefaultMaterialAttributes();

export function initStyles(rootClassName: string, styles: MiddlewareTextEditorStyles) {
  injectStyles({
    type: 'element',
    rootClassName,
    styles: {
      position: 'fixed',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      display: 'block',
      zIndex: styles.zIndex,

      [`&.${classNameMap.hide}`]: {
        display: 'none',
      },

      [`.${classNameMap.textarea}`]: {
        display: 'inline-flex',
        flexDirection: 'column',
        position: 'absolute',
        boxSizing: 'border-box',

        overflow: 'hidden',
        wordBreak: 'break-all',
        padding: '0',
        margin: '0',
        outline: 'none',
        border: `1px solid ${styles.boxBorderColor}`,
        background: `transparent`,
      },

      [`.${classNameMap.canvasWrapper}`]: {
        position: 'absolute',
      },
    },
  });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

const createBox = (opts: { size: MaterialSize; parent: HTMLDivElement }) => {
  const { size, parent } = opts;
  const div = document.createElement('div');
  const { x, y, width, height } = size;
  const angle = limitAngle(size.angle || 0);
  setHTMLCSSProps(div, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${angle}deg)`,
  });
  parent.appendChild(div);
  return div;
};

export const resetTextArea = (
  textarea: HTMLDivElement | null,
  canvasWrapper: HTMLDivElement | null,
  opts: InnerOptions
) => {
  if (!textarea || !canvasWrapper) {
    return;
  }
  const { viewScaleInfo, material, groupQueue } = opts;
  const { scale, offsetTop, offsetLeft } = viewScaleInfo;

  if (canvasWrapper?.children) {
    Array.from(canvasWrapper.children).forEach((child) => {
      child.remove();
    });
  }
  let parent = canvasWrapper;
  for (let i = 0; i < groupQueue.length; i++) {
    const group = groupQueue[i];
    const { x, y, width, height } = group;
    const angle = limitAngle(group.angle || 0);
    const size: MaterialSize = {
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
    parent = createBox({ size, parent });
  }

  const attributes = {
    ...defaultMaterialAttributes,
    ...material,
  };

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

  let justifyContent: ElementCSSInlineStyle['style']['justifyContent'] = 'center';
  let alignItems = 'center';
  if (attributes.textAlign === 'left') {
    justifyContent = 'start';
  } else if (attributes.textAlign === 'right') {
    justifyContent = 'end';
  }

  if (attributes.verticalAlign === 'top') {
    alignItems = 'start';
  } else if (attributes.verticalAlign === 'bottom') {
    alignItems = 'end';
  }

  setHTMLCSSProps(textarea, {
    justifyContent: justifyContent as HTMLCSSProps['justifyContent'],
    alignItems: alignItems as HTMLCSSProps['alignItems'],
    transform: `rotate(${limitAngle(material.angle || 0)}deg)`,
    left: `${mtrlX - 1}px`,
    top: `${mtrlY - 1}px`,
    width: `${mtrlW + 2}px`,
    height: `${mtrlH + 2}px`,
    cornerRadius: `${(typeof attributes.cornerRadius === 'number' ? attributes.cornerRadius : 0) * scale}px`,
    color: `${attributes.fill || '#000000'}`,
    textStroke: `${
      typeof attributes.strokeWidth === 'number' && attributes.strokeWidth > 0
        ? `${attributes.strokeWidth}px ${attributes.stroke}`
        : ''
    }`,
    '-webkit-text-stroke': `${
      typeof attributes.strokeWidth === 'number' && attributes.strokeWidth > 0
        ? `${attributes.strokeWidth}px ${attributes.stroke}`
        : ''
    }`,
    fontSize: `${attributes.fontSize * scale}px`,
    lineHeight: `${(attributes.lineHeight || attributes.fontSize) * scale}px`,
    fontFamily: enhanceFontFamliy(attributes.fontFamily),
    fontWeight: `${attributes.fontWeight}`,
    opacity: attributes.opacity || 1,

    // display: 'inline-flex',
    // flexDirection: 'column',
    // position: 'absolute',
    // boxSizing: 'border-box',

    // overflow: 'hidden',
    // wordBreak: 'break-all',
    // padding: '0',
    // margin: '0',
    // outline: 'none',
    // border: `1px solid ${styles.boxBorderColor}`,
    // background: `transparent`,
  });

  // textarea.value = attributes.text || '';
  textarea.innerText = attributes.text || '';
  parent.appendChild(textarea);
};
