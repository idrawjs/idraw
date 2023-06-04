import { createContext } from 'react';
import type { Data } from '@idraw/types';
import { DesignData, DesignState, DesignAction, DesignContext, DesignDrawDataType } from './types';
import { parseComponentsToDrawData } from './util/view-data';

export function createDesignData(): DesignData {
  return {
    components: [],
    modules: [],
    pages: []
  };
}

function parseDrawData(drawDataType: DesignDrawDataType, designData: DesignData | null): Data {
  let drawData: Data = { elements: [] };
  if (drawDataType === 'component') {
    drawData = parseComponentsToDrawData(designData?.components || []);
  }
  return drawData;
}

export function createDesignContextState(opts?: Partial<DesignState>): DesignState {
  const activeDrawDataType: DesignDrawDataType = 'component';
  const designData: DesignData = opts?.designData || createDesignData();
  const viewDrawData = parseDrawData(activeDrawDataType, designData);

  return {
    designData: designData,
    activeDrawDataType: activeDrawDataType,
    themeMode: opts?.themeMode || 'light',
    viewDrawData: viewDrawData,
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
      const newState = {
        ...state,
        ...{
          activeDrawDataType: action?.payload.activeDrawDataType,
          viewDrawData: parseDrawData(action?.payload?.activeDrawDataType, state.designData)
        }
      };
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
