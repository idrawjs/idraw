import type { LayoutSizeController, Material } from '@idraw/types';
import {
  keyLayoutActionType,
  keyLayoutControlType,
  keyLayoutController,
  keyLayoutIsHoverContent,
  keyLayoutIsHoverController,
  keyLayoutIsSelected,
  keyLayoutIsBusyMoving,
} from './static';
import { keyActionType as keyMaterialActionType, keyHoverMaterial } from '../selector';
import type { ActionType as MaterialActionType } from '../selector';

export type ActionType = 'resize' | null;

export type ControlType =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type LayoutSelectorSharedStorage = {
  [keyLayoutActionType]: ActionType | null;
  [keyLayoutControlType]: ControlType | null;
  [keyLayoutController]: LayoutSizeController | null;
  [keyMaterialActionType]: MaterialActionType | null;
  [keyHoverMaterial]: Material | null;
  [keyLayoutIsHoverContent]: boolean | null;
  [keyLayoutIsHoverController]: boolean | null;
  [keyLayoutIsSelected]: boolean | null;
  [keyLayoutIsBusyMoving]: boolean | null;
};
