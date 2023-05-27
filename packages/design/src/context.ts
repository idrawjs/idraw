import { createContext } from 'react';
import type { Dispatch } from 'react';
import { DesignData } from './types';

export interface DesignState {
  data: DesignData;
  themeMode: 'light' | 'dark';
}

export type DesignActionType = 'updateThemeMode' | 'updateData';

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
    case 'updateData': {
      if (!action?.payload?.data) {
        return state;
      }
      return {
        ...state,
        ...{
          data: action?.payload?.data
        }
      };
    }
    default:
      return state;
  }
}

export function createDesignContextState(opts?: Partial<DesignState>): DesignState {
  return {
    data: opts?.data || createDesignData(),
    themeMode: opts?.themeMode || 'light'
  };
}

export const Context = createContext<DesignContext>({});

export const Provider = Context.Provider;
