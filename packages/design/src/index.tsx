import React, { useEffect, useReducer } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import theme from 'antd/es/theme';
import classnames from 'classnames';
import { Sketch } from './modules';
import { createPrefixName } from './css';
import { Provider, createDesignContextState, createDesignReducer } from './context';
import type { DesignData } from './types';
import type { SketchProps } from './modules';
import './css/index.less';

const themeName = 'theme';
const themePrefixName = createPrefixName(themeName);

export type DesignProps = SketchProps & {
  designData?: DesignData;
  locale?: string; // TODO
  themeMode?: 'light' | 'dark';
};

export const Design = (props: DesignProps) => {
  const { width = 1000, height = 600, style, className, designData, themeMode } = props;

  const [state, dispatch] = useReducer(createDesignReducer, createDesignContextState({ designData, themeMode }));

  useEffect(() => {
    if (designData) {
      dispatch({
        type: 'updateDesignData',
        payload: { designData }
      });
    }
  }, [designData]);

  return (
    <Provider value={{ state, dispatch }}>
      <ConfigProvider theme={{ algorithm: state.themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <Sketch
          width={width}
          height={height}
          style={style}
          className={classnames([themePrefixName(), state?.themeMode === 'dark' ? themePrefixName('dark') : '', className])}
        />
      </ConfigProvider>
    </Provider>
  );
};

export * from './types';
