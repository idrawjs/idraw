import type { MiddlewareCreatorStyles, MiddlewareCreatorConfig, StylesProps } from '@idraw/types';
import { injectStyles, removeStyles, getMiddlewareValidStyles } from '@idraw/util';
import { classNameMap, creationAreaBorderWidth } from './static';

export function initStyles(rootClassName: string, styles: MiddlewareCreatorStyles) {
  const cls = (str: string) => `.${str}`;
  const stylesProps: StylesProps = {
    display: 'none',
    zIndex: styles.zIndex,
    position: 'absolute',
    background: 'transparent',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',

    [`&${cls(classNameMap.creative)}`]: {
      display: 'block',
    },

    // selection area box
    [cls(classNameMap.creationAreaBox)]: {
      position: 'absolute',
      outline: `${creationAreaBorderWidth}px solid ${styles.creationAreaBorderColor}`,
      background: '#0000ff1f', // TODO
    },
  };
  injectStyles({ styles: stylesProps, rootClassName, type: 'element' });
}

export function destroyStyles(rootClassName: string) {
  removeStyles({ rootClassName, type: 'element' });
}

export function getMiddlewareCreatorStyles<C = MiddlewareCreatorConfig, S = MiddlewareCreatorStyles>(config: C): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, ['zIndex', 'creationAreaBorderColor']);
  return styles;
}
