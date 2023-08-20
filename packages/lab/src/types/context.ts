import type { Dispatch } from 'react';
import type { Data } from '@idraw/types';
import { LabData, LabDrawDataType } from './data';

export interface LabState {
  activeDrawDataType: LabDrawDataType;
  labData: LabData;
  viewDrawData: Data;
  viewDrawUUID: string | null;
  themeMode: 'light' | 'dark';
}

export type LabActionType = 'updateThemeMode' | 'updateLabData' | 'switchDrawDataType';

export type LabAction = {
  type: LabActionType;
  payload: Partial<LabState>;
};

export type LabDispatch = Dispatch<LabAction>;

export interface LabContext {
  state: LabState;
  dispatch: LabDispatch;
}
