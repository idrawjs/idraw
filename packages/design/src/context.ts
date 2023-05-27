import { createContext } from 'react';
import { DesignData } from './types';

export interface DesignContext {
  data: DesignData;
}

export function createDesignData(): DesignData {
  return {
    components: [],
    modules: [],
    pages: []
  };
}

export function createDesignContextValue(opts?: { data?: DesignData }): DesignContext {
  return {
    data: opts?.data || createDesignData()
  };
}

const Context = createContext<DesignContext>(createDesignContextValue());

export const Provider = Context.Provider;
