import type { MiddlewareLayoutSelectorStyles } from '@idraw/types';
import { createId } from '@idraw/util';

export const key = 'LAYOUT_SELECTOR';
// export const keyHoverMaterial = Symbol(`${key}_hoverMaterialSize`);
export const keyLayoutActionType = Symbol(`${key}_layoutActionType`); // 'resize' | null = null;
export const keyLayoutControlType = Symbol(`${key}_layoutControlType`); // ControlType | null;
export const keyLayoutController = Symbol(`${key}_layoutController`); // MaterialSizeController | null = null;
export const keyLayoutIsHoverContent = Symbol(`${key}_layoutIsHoverContent`); // boolean | null
export const keyLayoutIsHoverController = Symbol(`${key}_layoutIsHoverController`); // boolean | null
export const keyLayoutIsSelected = Symbol(`${key}_layoutIsSelected`); // boolean | null
export const keyLayoutIsBusyMoving = Symbol(`${key}_layoutIsSelected`); // boolean | null

export const prefix = `idraw-middleware-layout-selector`;
export const getRootClassName = () => `${prefix}-${createId()}`;

export const ATTR_HANDLER_TYPE = 'data-idraw-handler-type';

export const selectedBoxBorderWidth = 1.5;
export const hoverBoxBorderWidth = 1;

export const cornerHandlerSize = 10;
export const cornerHandlerBorderWidth = 1.5;
export const edgeHandlerSize = 10;

// legacy
export const controllerSize = 10;

export const defaultStyle: MiddlewareLayoutSelectorStyles = {
  zIndex: 2,
  activeColor: '#b331c9',

  handlerBorderColor: '#b331c9',
  handlerBackground: '#ffffff',
  handlerHoverBackground: '#bb8fc3',
  handlerActiveBackground: '#b467c2',
};

export const classNameMap = {
  // hover
  hover: `${prefix}-hover`,

  // edge handler
  edgeHandler: `${prefix}-edgeHandler`,
  edgeTopHandler: `${prefix}-edgeTopHandler`,
  edgeRightHandler: `${prefix}-edgeRightandler`,
  edgeBottomHandler: `${prefix}-edgeBottomHandler`,
  edgeLeftHandler: `${prefix}-edgeLeftHandler`,
  // corner handler
  cornerHandler: `${prefix}-cornerHandler`,
  cornerTopLeftHandler: `${prefix}-cornerTopLeftHandler`,
  cornerTopRightHandler: `${prefix}-cornerTopRightHandler`,
  cornerBottomLeftHandler: `${prefix}-cornerBottomLeftHandler`,
  cornerBottomRightHandler: `${prefix}-cornerBottomRightHandler`,
};
