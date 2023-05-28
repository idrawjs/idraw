import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Tabs from 'antd/es/tabs';
import type { TabsProps } from 'antd';
import { prefixName } from './config';
import { LayerTree } from './layer-tree';
import FileOutlined from '@ant-design/icons/FileOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import ProjectOutlined from '@ant-design/icons/ProjectOutlined';

const items: TabsProps['items'] = [
  {
    key: '1',
    label: <FileOutlined className={prefixName('tab', 'title')} />,
    children: (
      <div style={{ width: '100%', overflow: 'auto' }}>
        <LayerTree />
      </div>
    )
  },
  {
    key: '2',
    label: <AppstoreOutlined className={prefixName('tab', 'title')} />,
    children: `Content of Tab Pane 2`
  },
  {
    key: '3',
    label: <ProjectOutlined className={prefixName('tab', 'title')} />,
    children: `Content of Tab Pane 3`
  }
];

export interface PanelLayerProps {
  className?: string;
  style?: CSSProperties;
}

export const PanelLayer = (props: PanelLayerProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      {/* <div className={prefixName('header')}>header</div> */}
      <div className={prefixName('content')}>
        <Tabs className={prefixName('tabs')} defaultActiveKey="1" centered items={items} size="small" />
      </div>
      {/* <div className={prefixName('footer')}>footer</div> */}
    </div>
  );
};
