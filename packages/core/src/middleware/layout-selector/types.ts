import type { LayoutSizeController, Element } from '@idraw/types';
import { keyLayoutActionType, keyLayoutControlType, keyLayoutController, keyLayoutIsHover, keyLayoutIsSelected } from './config';
import { keyActionType as keyElementActionType, keyHoverElement } from '../selector';
import type { ActionType as ElementActionType } from '../selector';

export type ActionType = 'resize' | null;

export type ControlType = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type LayoutSelectorSharedStorage = {
  [keyLayoutActionType]: ActionType | null;
  [keyLayoutControlType]: ControlType | null;
  [keyLayoutController]: LayoutSizeController | null;
  [keyElementActionType]: ElementActionType | null;
  [keyHoverElement]: Element | null;
  [keyLayoutIsHover]: boolean | null;
  [keyLayoutIsSelected]: boolean | null;
};
