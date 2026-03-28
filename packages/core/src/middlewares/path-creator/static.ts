import { createId, getMiddlewareValidStyles } from '@idraw/util';
import type { MiddlewarePathCreatorConfig, MiddlewarePathCreatorStyles } from '@idraw/types';

export const key = 'PATH-CREATOR';

const prefix = `idraw-middleware-path-creator`;

export const getRootClassName = () => `${prefix}-${createId()}`;

export const classNameMap = {
  hide: `${prefix}-hide`,
  anchor: `${prefix}-anchor`,
  director: `${prefix}-director`,
  directorLines: `${prefix}-director-lines`,
  pathLine: `${prefix}-path-line`,
  selected: `${prefix}-selected`,
};

export const ATTR_X = `data-x`;
export const ATTR_Y = `data-y`;
export const ATTR_ANGLE = `data-angle`;
export const ATTR_TYPE = `data-type`;
export const ATTR_HELPER_TYPE = `data-helper-type`;
export const ATTR_AHCHOR_CMD_TYPE = `data-anchor-cmd-type`;
export const ATTR_AHCHOR_INDEX = `data-anchor-index`;
export const ATTR_AHCHOR_ID = `data-anchor-id`;

export const HELPER_ROOT = 'root';
export const HELPER_ANCHOR = 'anchor';

export const defaultConfig: MiddlewarePathCreatorConfig = {
  anchorSize: 8,
  anchorBorderWidth: 2,
  anchorBorderColor: '#157ed1',
  anchorBackground: '#ffffff',
  anchorHoverBorderColor: '#1671b8',
  anchorHoverBackground: '#cfe4f4',
  anchorActiveBorderColor: '#0d548c',
  anchorActiveBackground: '#88c0ec',

  defaultStroke: '#a0a0a0',
  defaultStrokeWidth: 2,
};

export function getMiddlewarePathCreatorStyles<C = MiddlewarePathCreatorConfig, S = MiddlewarePathCreatorStyles>(
  config: C
): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'anchorSize',
    'anchorBorderWidth',
    'anchorBorderColor',
    'anchorBackground',
    'anchorHoverBorderColor',
    'anchorHoverBackground',
    'anchorActiveBorderColor',
    'anchorActiveBackground',
    'defaultStroke',
    'defaultStrokeWidth',
  ]);
  return styles;
}
