import type { MiddlewareLayoutSelectorStyle } from '@idraw/types';

export const key = 'LAYOUT_SELECT';
// export const keyHoverElement = Symbol(`${key}_hoverElementSize`);
export const keyLayoutActionType = Symbol(`${key}_layoutActionType`); // 'resize' | null = null;
export const keyLayoutControlType = Symbol(`${key}_layoutControlType`); // ControlType | null;
export const keyLayoutController = Symbol(`${key}_layoutController`); // ElementSizeController | null = null;
export const keyLayoutIsHoverContent = Symbol(`${key}_layoutIsHoverContent`); // boolean | null
export const keyLayoutIsHoverController = Symbol(`${key}_layoutIsHoverController`); // boolean | null
export const keyLayoutIsSelected = Symbol(`${key}_layoutIsSelected`); // boolean | null
export const keyLayoutIsBusyMoving = Symbol(`${key}_layoutIsSelected`); // boolean | null

// const selectColor = '#b331c9';
// const disabledColor = '#5b5959b5';

export const controllerSize = 10;

export const defaultStyle: MiddlewareLayoutSelectorStyle = {
  activeColor: '#b331c9'
};
