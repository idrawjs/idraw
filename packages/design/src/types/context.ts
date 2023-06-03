import type { Dispatch } from 'react';
import type { Data } from '@idraw/types';
import { DesignData, DesignDrawDataType } from './data';

export interface DesignState {
  activeDrawDataType: DesignDrawDataType;
  designData: DesignData | null;
  viewDrawData: Data | null;
  viewDrawUUID: string | null;
  themeMode: 'light' | 'dark';
}

export type DesignActionType = 'updateThemeMode' | 'updateDesignData' | 'switchDrawDataType';

export type DesignAction = {
  type: DesignActionType;
  payload: Partial<DesignState>;
};

export type DesignDispatch = Dispatch<DesignAction>;

export interface DesignContext {
  state: DesignState;
  dispatch: DesignDispatch;
}
