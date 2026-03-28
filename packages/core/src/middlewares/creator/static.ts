import type { MiddlewareCreatorStyles, MiddlewareCreatorConfig } from '@idraw/types';
import { createId } from '@idraw/util';

export const key = 'CREATOR';

export const keyStartPoint = Symbol(`${key}_startPoint`);
export const keyEndPoint = Symbol(`${key}_endPoint`);
export const keyActiveMaterialType = Symbol(`${key}_activeMaterialType`);

export const prefix = `idraw-middleware-creator`;
export const getRootClassName = () => `${prefix}-${createId()}`;

export const creationAreaBorderWidth = 1.5;

export const defaultStyles: MiddlewareCreatorStyles = {
  zIndex: 2,
  creationAreaBorderColor: '#1973ba',
};

export const defaultConfig: Partial<MiddlewareCreatorConfig> = {
  selectAfterCreated: true,
};

export const classNameMap = {
  // selection area
  creationAreaBox: `${prefix}-creationAreaBox`,
  creative: `${prefix}-creative`,
};
