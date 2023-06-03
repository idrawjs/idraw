import { createContext } from 'react';
import { DesignData, DesignState, DesignAction, DesignContext } from './types';
import { parseComponentsToDrawData } from './util/view-data';

export function createDesignData(): DesignData {
  return {
    components: [],
    modules: [],
    pages: []
  };
}

export function createDesignContextState(opts?: Partial<DesignState>): DesignState {
  return {
    designData: opts?.designData || createDesignData(),
    activeDrawDataType: 'component', // TODO
    themeMode: opts?.themeMode || 'light',
    viewDrawData: null,
    viewDrawUUID: null
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
          designData: action?.payload?.designData
        }
      };
    }
    case 'switchDrawDataType': {
      if (!action?.payload?.activeDrawDataType) {
        return state;
      }
      let newState = {
        ...state,
        ...{
          activeDrawDataType: action?.payload.activeDrawDataType
        }
      };
      if (action.payload.activeDrawDataType === 'component') {
        newState = {
          ...newState,
          viewDrawData: parseComponentsToDrawData(state.designData?.components || [])
        };
      }

      return newState;
    }

    default:
      return state;
  }
}

export const Context = createContext<DesignContext>({
  state: createDesignContextState(),
  dispatch: () => {
    return;
  }
});

export const Provider = Context.Provider;
