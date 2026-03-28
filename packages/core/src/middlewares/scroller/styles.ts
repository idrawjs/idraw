import type { MiddlewareScrollerStyles, MiddlewareScrollerConfig, StylesProps } from '@idraw/types';
import { injectStyles, removeStyles, getMiddlewareValidStyles } from '@idraw/util';
import { classNameMap, scrollbarTrackSize, scrollbarThumbLength, scrollbarThumbSize } from './static';

export function initStyles(rootClassName: string, styles: MiddlewareScrollerStyles) {
  const cls = (str: string) => `.${str}`;
  const stylesProps: StylesProps = {
    zIndex: styles.zIndex,
    position: 'absolute',
    background: 'transparent',

    [cls(classNameMap.thumb)]: {
      position: 'absolute',
      background: styles.thumbBackground,
      border: `1px solid ${styles.thumbBorderColor}`,
      borderRadius: `${scrollbarThumbSize / 2}px`,
      boxSizing: 'border-box',

      [`&:hover`]: {
        background: styles.hoverThumbBackground,
        border: `1px solid ${styles.hoverThumbBorderColor}`,
      },
      [`&:active`]: {
        background: styles.activeThumbBackground,
        border: `1px solid ${styles.activeThumbBorderColor}`,
      },
    },

    [`&${cls(classNameMap.vertical)}`]: {
      top: 0,
      bottom: 0,
      right: 0,
      left: 'unset',
      width: scrollbarTrackSize,
      overflow: 'hidden',

      [cls(classNameMap.thumb)]: {
        top: scrollbarTrackSize,
        bottom: 'unset',
        left: scrollbarThumbSize / 2,
        right: 'unset',
        height: scrollbarThumbLength,
        width: scrollbarThumbSize,
      },
    },
    [`&${cls(classNameMap.horizontal)}`]: {
      left: 0,
      right: 0,
      top: 'unset',
      bottom: 0,
      height: scrollbarTrackSize,
      overflow: 'hidden',

      [cls(classNameMap.thumb)]: {
        top: scrollbarThumbSize / 2,
        bottom: 'unset',
        left: scrollbarTrackSize,
        right: 'unset',
        height: scrollbarThumbSize,
        width: scrollbarThumbLength,
      },
    },
  };
  injectStyles({ styles: stylesProps, rootClassName, type: 'element' });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

export function getMiddlewareScrollerStyles<C = MiddlewareScrollerConfig, S = MiddlewareScrollerStyles>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'zIndex',
    'thumbBackground',
    'thumbBorderColor',
    'hoverThumbBackground',
    'hoverThumbBorderColor',
    'activeThumbBackground',
    'activeThumbBorderColor',
  ]);
  return styles;
}
