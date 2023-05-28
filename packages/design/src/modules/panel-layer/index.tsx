import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Tabs from 'antd/es/tabs';
import type { TabsProps } from 'antd';
import { prefixName } from './config';
import { LayerTree } from './layer-tree';
import FileOutlined from '@ant-design/icons/FileOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';

const items: TabsProps['items'] = [
  {
    key: 'page',
    label: <FileOutlined className={prefixName('tab', 'title')} />,
    children: (
      <div style={{ width: '100%', overflow: 'auto' }}>
        <LayerTree type="page" />
      </div>
    )
  },
  {
    key: 'module',
    label: <AppstoreOutlined className={prefixName('tab', 'title')} />,
    children: (
      <div style={{ width: '100%', overflow: 'auto' }}>
        <LayerTree type="module" />
      </div>
    )
  },
  {
    key: 'component',
    label: <CalculatorOutlined className={prefixName('tab', 'title')} />,
    children: (
      <div style={{ width: '100%', overflow: 'auto' }}>
        <LayerTree type="component" />
      </div>
    )
  }
];

export interface PanelLayerProps {
  className?: string;
  style?: CSSProperties;
}

export const PanelLayer = (props: PanelLayerProps) => {
  const { className, style } = props;

  const defaultTabKey = items[2].key;
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      {/* <div className={prefixName('header')}>header</div> */}
      <div className={prefixName('content')}>
        <Tabs className={prefixName('tabs')} defaultActiveKey={defaultTabKey} centered items={items} size="small" />
      </div>
      {/* <div className={prefixName('footer')}>footer</div> */}
    </div>
  );
};
