import { createId, getMiddlewareValidStyles } from '@idraw/util';
import type { MiddlewarePathEditorStyles, MiddlewarePathEditorConfig } from '@idraw/types';

export const key = 'PATH-EDITOR';

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

export const ATTR_UUID = `data-uuid`;
export const ATTR_X = `data-x`;
export const ATTR_Y = `data-y`;
export const ATTR_W = `data-w`;
export const ATTR_H = `data-h`;
export const ATTR_ANGLE = `data-angle`;
export const ATTR_TYPE = `data-type`;
export const ATTR_HELPER_TYPE = `data-helper-type`;
export const ATTR_AHCHOR_CMD_TYPE = `data-anchor-cmd-type`;
export const ATTR_AHCHOR_INDEX = `data-anchor-index`;
export const ATTR_AHCHOR_ID = `data-anchor-id`;
export const ATTR_DIRECTOR_FROM_AHCHOR_ID = `data-director-from-anchor-id`;
export const ATTR_DIRECTOR_CONTROL_TYPE = `data-director-control-type`;
export const ATTR_DIRECTOR_OPENED_BY_AHCHOR_ID = `data-director-opened-by-anchor-id`;

export const HELPER_GROUP = 'group';
export const HELPER_ELEMENT = 'material';
export const HELPER_ANCHOR = 'anchor';
export const HELPER_DIRECTOR = 'director';
export const HELPER_DIRECTOR_LINE = 'director-line';
export const HELPER_PATH_PREVIEW = 'path-preview';
export const HELPER_PATH_DEFINITION = 'path-definition';

export const defaultStyles: MiddlewarePathEditorStyles = {
  zIndex: 2,
  anchorSize: 8,
  anchorSelectedSize: 12,
  anchorBorderWidth: 2,
  anchorBorderColor: '#0c8ce9',
  anchorBackground: '#ffffff',
  anchorHoverBorderColor: '#1671b8',
  anchorHoverBackground: '#cfe4f4',
  anchorActiveBorderColor: '#0d548c',
  anchorActiveBackground: '#88c0ec',

  directorSize: 10,
  directorBorderWidth: 2,
  directorBorderColor: '#7315d1ff',
  directorBackground: '#ffffff',
  directorHoverBorderColor: '#4716b8ff',
  directorHoverBackground: '#ebcff4ff',
  directorActiveBorderColor: '#510d8cff',
  directorActiveBackground: '#c988ecff',
  directorLineColor: '#7315d1ff',

  helperStrokeColor: '#0c8ce9',
  helperStrokeWidth: 1,
};

export function getMiddlewarePathEditorStyles<C = MiddlewarePathEditorConfig, S = MiddlewarePathEditorStyles>(
  config: C
): S {
  const styles: S = getMiddlewareValidStyles<C, S>(config, [
    'zIndex',
    'anchorSize',
    'anchorSelectedSize',
    'anchorBorderWidth',
    'anchorBorderColor',
    'anchorBackground',
    'anchorHoverBorderColor',
    'anchorHoverBackground',
    'anchorActiveBorderColor',
    'anchorActiveBackground',
    'directorSize',
    'directorBorderWidth',
    'directorBorderColor',
    'directorBackground',
    'directorHoverBorderColor',
    'directorHoverBackground',
    'directorActiveBorderColor',
    'directorActiveBackground',
    'directorLineColor',
    'helperStrokeColor',
    'helperStrokeWidth',
  ]);
  return styles;
}
