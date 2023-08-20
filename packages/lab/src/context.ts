import { createContext } from 'react';
import type { Data } from '@idraw/types';
import { LabData, LabState, LabAction, LabContext, LabDrawDataType } from './types';
import { parseComponentsToDrawData } from './util/view-data';

export function createLabData(): LabData {
  return {
    components: [],
    modules: [],
    pages: []
  };
}

function parseDrawData(drawDataType: LabDrawDataType, labData: LabData | null): Data {
  let drawData: Data = { elements: [] };
  if (drawDataType === 'component') {
    drawData = parseComponentsToDrawData(labData?.components || []);
  }
  return drawData;
}

export function createLabContextState(opts?: Partial<LabState>): LabState {
  const activeDrawDataType: LabDrawDataType = 'component';
  const labData: LabData = opts?.labData || createLabData();
  const viewDrawData = parseDrawData(activeDrawDataType, labData);

  return {
    labData: labData,
    activeDrawDataType: activeDrawDataType,
    themeMode: opts?.themeMode || 'light',
    viewDrawData: viewDrawData,
    viewDrawUUID: null
  };
}

export function createLabReducer(state: LabState, action: LabAction): LabState {
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
    case 'updateLabData': {
      if (!action?.payload?.labData) {
        return state;
      }
      return {
        ...state,
        ...{
          labData: action?.payload?.labData
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
          viewDrawData: parseDrawData(action?.payload?.activeDrawDataType, state.labData)
        }
      };
      return newState;
    }

    default:
      return state;
  }
}

export const Context = createContext<LabContext>({
  state: createLabContextState(),
  dispatch: () => {
    return;
  }
});

export const Provider = Context.Provider;
