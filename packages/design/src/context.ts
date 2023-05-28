import { createContext } from 'react';
import type { Dispatch } from 'react';
import type { Data } from '@idraw/types';
import { DesignData } from './types';

export interface DesignState {
  designData: DesignData | null;
  viewDrawData: Data | null;
  viewDrawUUID: string | null;
  themeMode: 'light' | 'dark';
}

export type DesignActionType = 'updateThemeMode' | 'updateDesignData';

export type DesignAction = {
  type: DesignActionType;
  payload: Partial<DesignState>;
};

export type DesignDispatch = Dispatch<DesignAction>;

export interface DesignContext {
  state?: DesignState;
  dispatch?: DesignDispatch;
}

export function createDesignData(): DesignData {
  return {
    components: [],
    modules: [],
    pages: []
  };
}

export function createDesignReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'updateThemeMode': {
      if (!action?.payload?.themeMode) {
        return state;
      }
      return {
        ...state,
        ...{
          themeMode: action?.payload?.themeMode
        }
      };
    }
    case 'updateDesignData': {
      if (!action?.payload?.designData) {
        return state;
      }
      return {
        ...state,
        ...{
          data: action?.payload?.designData
        }
      };
    }
    default:
      return state;
  }
}

export function createDesignContextState(opts?: Partial<DesignState>): DesignState {
  return {
    designData: opts?.designData || createDesignData(),
    themeMode: opts?.themeMode || 'light',
    viewDrawData: null,
    viewDrawUUID: null
  };
}

export const Context = createContext<DesignContext>({});

export const Provider = Context.Provider;
