import type { MiddlewareSelectorStyles, MiddlewareSelectorConfig, StylesProps } from '@idraw/types';
import { injectStyles, removeStyles, getMiddlewareValidStyles } from '@idraw/util';
import {
  classNameMap,
  getSvgRotate,
  selectedBoxBorderWidth,
  selectedNestedBoxBorderWidth,
  hoverBoxBorderWidth,
  lockedBoxBorderWidth,
  edgeHandlerSize,
  cornerHandlerSize,
  cornerHandlerBorderWidth,
  selectionAreaBorderWidth,
  rotateHandlerSize,
} from './static';

export function initStyles(rootClassName: string, styles: MiddlewareSelectorStyles) {
  const cls = (str: string) => `.${str}`;
  const stylesProps: StylesProps = {
    display: 'flex',
    position: 'absolute',
    zIndex: styles.zIndex,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',

    // hover
    [cls(classNameMap.hoverTargetBox)]: {
      position: 'absolute',
      outline: `${hoverBoxBorderWidth}px solid ${styles.activeColor}`,
    },

    // nested box
    [cls(classNameMap.nestedBox)]: {
      position: 'absolute',
      [`&${cls(classNameMap.groupBox)}`]: {
        outline: `${selectedNestedBoxBorderWidth}px dashed ${styles.activeColor}`,
      },
      [cls(classNameMap.groupBox)]: {
        outline: `${selectedNestedBoxBorderWidth}px dashed ${styles.activeColor}`,
      },
    },

    // locked box
    [cls(classNameMap.lockedTargetBox)]: {
      position: 'absolute',
      outline: `${lockedBoxBorderWidth}px solid ${styles.lockedColor}`,
    },

    // selected box
    [cls(classNameMap.selectedBox)]: {
      position: 'absolute',
      [`&${cls(classNameMap.hideHandler)}`]: {
        [cls(classNameMap.cornerHandler)]: {
          display: 'none',
        },
        [cls(classNameMap.edgeHandler)]: {
          display: 'none',
        },
        [cls(classNameMap.rotateHandler)]: {
          display: 'none',
        },
      },
    },
    [cls(classNameMap.selectedTargetBox)]: {
      position: 'absolute',
      outline: `${selectedBoxBorderWidth}px solid ${styles.handlerBorderColor}`,

      [cls(classNameMap.cornerHandler)]: {
        position: 'absolute',
        outline: `${cornerHandlerBorderWidth}px solid ${styles.handlerBorderColor}`,
        background: styles.handlerBackground,
        width: `${cornerHandlerSize}px`,
        height: `${cornerHandlerSize}px`,

        ['&:hover']: {
          background: styles.handlerHoverBackground,
        },
        ['&:active']: {
          background: styles.handlerActiveBackground,
        },

        [`&${cls(classNameMap.cornerTopLeftHandler)}`]: {
          top: `${-cornerHandlerSize / 2}px`,
          left: `${-cornerHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.cornerTopRightHandler)}`]: {
          top: `${-cornerHandlerSize / 2}px`,
          right: `${-cornerHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.cornerBottomLeftHandler)}`]: {
          bottom: `${-cornerHandlerSize / 2}px`,
          left: `${-cornerHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.cornerBottomRightHandler)}`]: {
          bottom: `${-cornerHandlerSize / 2}px`,
          right: `${-cornerHandlerSize / 2}px`,
        },
      },

      [cls(classNameMap.rotateHandler)]: {
        position: 'absolute',
        top: -40,
        left: `50%`,
        transform: `translateX(-50%)`,
        width: rotateHandlerSize,
        height: rotateHandlerSize,
        background: '#FFFFFF',
        borderRadius: `${rotateHandlerSize / 2}px`,

        ['&::after']: {
          display: 'inline-block',
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundImage: `url(data:image/svg+xml,${encodeURIComponent(getSvgRotate(styles.activeColor))})`,
          backgroundPosition: 'center',
          backgroundSize: `${rotateHandlerSize}px`,
        },
      },

      [cls(classNameMap.edgeHandler)]: {
        position: 'absolute',
        background: 'transparent',

        [`&${cls(classNameMap.edgeLeftHandler)}`]: {
          width: `${edgeHandlerSize}px`,
          top: `${edgeHandlerSize / 2}px`,
          left: `${-edgeHandlerSize / 2}px`,
          bottom: `${edgeHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.edgeRightHandler)}`]: {
          width: `${edgeHandlerSize}px`,
          top: `${edgeHandlerSize / 2}px`,
          right: `${-edgeHandlerSize / 2}px`,
          bottom: `${edgeHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.edgeTopHandler)}`]: {
          height: `${edgeHandlerSize}px`,
          top: `${-edgeHandlerSize / 2}px`,
          left: `${edgeHandlerSize / 2}px`,
          right: `${edgeHandlerSize / 2}px`,
        },
        [`&${cls(classNameMap.edgeBottomHandler)}`]: {
          height: `${edgeHandlerSize}px`,
          bottom: `${-edgeHandlerSize / 2}px`,
          left: `${edgeHandlerSize / 2}px`,
          right: `${edgeHandlerSize / 2}px`,
        },
      },
    },

    // selection area box
    [cls(classNameMap.selectionAreaBox)]: {
      position: 'absolute',
      outline: `${selectionAreaBorderWidth}px solid ${styles.selectionAreaBorderColor}`,
      background: styles.selectionAreaBackground,
    },
  };
  injectStyles({ styles: stylesProps, rootClassName, type: 'element' });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

export function getMiddlewareSelectorStyles<C = MiddlewareSelectorConfig, S = MiddlewareSelectorStyles>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'zIndex',
    'activeColor',
    'handlerBorderColor',
    'handlerBackground',
    'handlerHoverBackground',
    'handlerActiveBackground',
    'selectionAreaBackground',
    'selectionAreaBorderColor',
    'lockedColor',
    'referenceColor',
  ]);
  return styles;
}
