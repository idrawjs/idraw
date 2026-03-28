import type { MiddlewareLayoutSelectorStyles, MiddlewareLayoutSelectorConfig, StylesProps } from '@idraw/types';
import { injectStyles, removeStyles, getMiddlewareValidStyles } from '@idraw/util';
import {
  classNameMap,
  cornerHandlerBorderWidth,
  cornerHandlerSize,
  edgeHandlerSize,
  hoverBoxBorderWidth,
  selectedBoxBorderWidth,
} from './static';

export function initStyles(rootClassName: string, styles: MiddlewareLayoutSelectorStyles) {
  const cls = (str: string) => `.${str}`;
  const stylesProps: StylesProps = {
    zIndex: styles.zIndex,
    position: 'absolute',
    background: 'transparent',

    [`&${cls(classNameMap.hover)}`]: {
      [`&${cls(classNameMap.cornerHandler)}`]: {
        display: 'none',
      },
      [`&${cls(classNameMap.edgeHandler)}`]: {
        width: `${hoverBoxBorderWidth}px`,
        height: `${hoverBoxBorderWidth}px`,

        [`&${cls(classNameMap.edgeLeftHandler)}`]: {
          width: `${hoverBoxBorderWidth}px`,
        },
        [`&${cls(classNameMap.edgeRightHandler)}`]: {
          width: `${hoverBoxBorderWidth}px`,
        },
        [`&${cls(classNameMap.edgeTopHandler)}`]: {
          height: `${hoverBoxBorderWidth}px`,
        },
        [`&${cls(classNameMap.edgeBottomHandler)}`]: {
          height: `${hoverBoxBorderWidth}px`,
        },
      },
    },

    [`&${cls(classNameMap.cornerHandler)}`]: {
      outline: `${cornerHandlerBorderWidth}px solid ${styles.handlerBorderColor}`,
      background: styles.handlerBackground,
      width: `${cornerHandlerSize}px`,
      height: `${cornerHandlerSize}px`,
      top: 'unset',
      bottom: 'unset',
      left: 'unset',
      right: 'unset',

      ['&:hover']: {
        background: styles.handlerHoverBackground,
      },
      ['&:active']: {
        background: styles.handlerActiveBackground,
      },

      [`&${cls(classNameMap.cornerTopLeftHandler)}`]: {
        transform: 'translate(-50%, -50%)',
      },
      [`&${cls(classNameMap.cornerTopRightHandler)}`]: {
        transform: 'translate(-50%, -50%)',
      },
      [`&${cls(classNameMap.cornerBottomLeftHandler)}`]: {
        transform: 'translate(-50%, -50%)',
      },
      [`&${cls(classNameMap.cornerBottomRightHandler)}`]: {
        transform: 'translate(-50%, -50%)',
      },
    },

    [`&${cls(classNameMap.edgeHandler)}`]: {
      width: `${cornerHandlerSize}px`,
      height: `${cornerHandlerSize}px`,

      ['&:after']: {
        position: 'absolute',
        content: '""',
        background: styles.handlerBorderColor,
      },

      [`&${cls(classNameMap.edgeLeftHandler)}`]: {
        width: `${edgeHandlerSize}px`,
        transform: 'translateX(-50%)',
        ['&:after']: {
          top: 0,
          bottom: 0,
          left: '50%',
          right: 'unset',
          width: selectedBoxBorderWidth,
        },
      },
      [`&${cls(classNameMap.edgeRightHandler)}`]: {
        width: `${edgeHandlerSize}px`,
        transform: 'translateX(-50%)',
        ['&:after']: {
          top: 0,
          bottom: 0,
          left: '50%',
          right: 'unset',
          width: selectedBoxBorderWidth,
        },
      },
      [`&${cls(classNameMap.edgeTopHandler)}`]: {
        height: `${edgeHandlerSize}px`,
        transform: 'translateY(-50%)',
        ['&:after']: {
          left: 0,
          right: 0,
          top: '50%',
          bottom: 'unset',
          height: selectedBoxBorderWidth,
        },
      },
      [`&${cls(classNameMap.edgeBottomHandler)}`]: {
        height: `${edgeHandlerSize}px`,
        transform: 'translateY(-50%)',
        ['&:after']: {
          left: 0,
          right: 0,
          top: '50%',
          bottom: 'unset',
          height: selectedBoxBorderWidth,
        },
      },
    },
  };
  injectStyles({ styles: stylesProps, rootClassName, type: 'element' });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

export function getMiddlewareLayoutSelectorStyles<
  C = MiddlewareLayoutSelectorConfig,
  S = MiddlewareLayoutSelectorStyles,
>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'zIndex',
    'activeColor',
    'handlerBorderColor',
    'handlerBackground',
    'handlerHoverBackground',
    'handlerActiveBackground',
  ]);
  return styles;
}
