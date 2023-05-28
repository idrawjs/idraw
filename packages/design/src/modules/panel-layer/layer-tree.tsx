import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Tree from 'antd/es/tree';
import DownOutlined from '@ant-design/icons/DownOutlined';
import { prefixName } from './config';
import type { DataNode, TreeProps } from 'antd/es/tree';

const { DirectoryTree } = Tree;

const treeData: DataNode[] = [0, 1].map((i) => {
  return {
    title: 'design-layer-data parent 1',
    key: `${i}-0`,
    children: [
      {
        title: 'design-layer-data parent 1-0',
        key: `${i}-0-0`,
        children: [
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-0-0`
          },
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-0-1`
          },
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-0-2`
          }
        ]
      },
      {
        title: 'design-layer-data parent 1-1',
        key: `${i}-0-1`,
        children: [
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-1-0`
          }
        ]
      },
      {
        title: 'design-layer-data parent 1-2',
        key: `${i}-0-2`,
        children: [
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-2-0`
          },
          {
            title: 'design-layer-data leaf',
            key: `${i}-0-2-1`
          }
        ]
      }
    ]
  };
});

const baseName = 'layer-tree';

export interface LayerTreeProps {
  className?: string;
  style?: CSSProperties;
}

export const LayerTree = (props: LayerTreeProps) => {
  const { className, style } = props;

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  return (
    <div style={style} className={classnames(prefixName(baseName), className)}>
      <DirectoryTree showLine blockNode switcherIcon={<DownOutlined />} icon={null} defaultExpandedKeys={['0-0-0']} onSelect={onSelect} treeData={treeData} />
    </div>
  );
};
