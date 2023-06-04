import React, { useContext } from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Tabs from 'antd/es/tabs';
import type { TabsProps } from 'antd';
import FileOutlined from '@ant-design/icons/FileOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';
import { prefixName } from './config';
import { LayerTree } from './layer-tree';
import { Context } from '../../context';
import { DesignDrawDataType } from '../../types';

const items: TabsProps['items'] = [
  {
    key: 'page',
    label: <FileOutlined className={prefixName('tab', 'title')} />
  },
  {
    key: 'module',
    label: <AppstoreOutlined className={prefixName('tab', 'title')} />
  },
  {
    key: 'component',
    label: <CalculatorOutlined className={prefixName('tab', 'title')} />
  }
];

export interface PanelLayerProps {
  className?: string;
  style?: CSSProperties;
}

export const PanelLayer = (props: PanelLayerProps) => {
  const { className, style } = props;
  const { state, dispatch } = useContext(Context);

  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <div className={prefixName('header')}>
        <Tabs
          className={prefixName('tabs')}
          tabBarStyle={{ marginBottom: 0 }}
          activeKey={state?.activeDrawDataType as string}
          centered
          items={items}
          size="small"
          onTabClick={(activeKey: string) => {
            dispatch({ type: 'switchDrawDataType', payload: { activeDrawDataType: activeKey as DesignDrawDataType } });
          }}
        />
      </div>
      <div className={prefixName('content')}>
        <LayerTree type={state.activeDrawDataType} />
      </div>
      <div className={prefixName('footer')}>footer</div>
    </div>
  );
};
