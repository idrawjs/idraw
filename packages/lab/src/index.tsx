import React, { useEffect, useReducer } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import theme from 'antd/es/theme';
import classnames from 'classnames';
import { Dashboard } from './modules';
import { createPrefixName } from './css';
import { Provider, createLabContextState, createLabReducer } from './context';
import type { LabData } from './types';
import type { DashboardProps } from './modules';
import './css/index.less';

const themeName = 'theme';
const themePrefixName = createPrefixName(themeName);

export type LabProps = DashboardProps & {
  labData?: LabData;
  locale?: string; // TODO
  themeMode?: 'light' | 'dark';
};

export const Lab = (props: LabProps) => {
  const { width = 1000, height = 600, style, className, labData, themeMode } = props;

  const [state, dispatch] = useReducer(createLabReducer, createLabContextState({ labData, themeMode }));

  useEffect(() => {
    if (labData) {
      dispatch({
        type: 'updateLabData',
        payload: { labData }
      });
    }
  }, [labData]);

  return (
    <Provider value={{ state, dispatch }}>
      <ConfigProvider theme={{ algorithm: state.themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <Dashboard
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
