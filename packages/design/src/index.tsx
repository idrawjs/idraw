import React, { useEffect, useReducer } from 'react';
import classnames from 'classnames';
import { Sketch } from './modules';
import { createPrefixName } from './css';
import type { SketchProps } from './modules';
import { Provider, createDesignContextState, createDesignReducer } from './context';
import type { DesignData } from './types';
import './css/index.less';

const themeName = 'theme';
const themePrefixName = createPrefixName(themeName);

export type DesignProps = SketchProps & {
  data?: DesignData;
  locale?: string; // TODO
  themeMode?: 'light' | 'dark';
};

export const Design = (props: DesignProps) => {
  const { width = 1000, height = 600, style, className, data, themeMode } = props;

  const [state, dispatch] = useReducer(createDesignReducer, createDesignContextState({ data, themeMode }));

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'updateData',
        payload: { data }
      });
    }
  }, [data]);

  useEffect(() => {
    setTimeout(() => {
      dispatch?.({
        type: 'updateThemeMode',
        payload: {
          themeMode: 'dark'
        }
      });
    }, 2000);
  }, []);

  return (
    <Provider value={{ state, dispatch }}>
      <Sketch
        width={width}
        height={height}
        style={style}
        className={classnames([themePrefixName(), state?.themeMode === 'dark' ? themePrefixName('dark') : '', className])}
      />
    </Provider>
  );
};

export * from './types';
