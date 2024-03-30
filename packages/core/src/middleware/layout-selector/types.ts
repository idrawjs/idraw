import type { LayoutSizeController } from '@idraw/types';
import { keyLayoutActionType, keyLayoutControlType, keyLayoutController } from './config';
import { keyActionType as keyElementActionType } from '../selector';
import type { ActionType as ElementActionType } from '../selector';

export type ActionType = 'hover' | 'resize' | null;

export type ControlType = 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type LayoutSelectorSharedStorage = {
  [keyLayoutActionType]: ActionType | null;
  [keyLayoutControlType]: ControlType | null;
  [keyLayoutController]: LayoutSizeController | null;
  [keyElementActionType]: ElementActionType | null;
};
