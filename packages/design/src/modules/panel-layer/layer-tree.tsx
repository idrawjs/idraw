import React, { useEffect, useContext } from 'react';
import classnames from 'classnames';
import Tree from 'antd/es/tree';
import DownOutlined from '@ant-design/icons/DownOutlined';
import { prefixName } from './config';
import { Context } from '../../context';
import { parseComponentViewTree } from '../../util/component';

import type { CSSProperties } from 'react';
import type { DataNode, TreeProps } from 'antd/es/tree';
import type { DesignItemType } from '../../types';

const { DirectoryTree } = Tree;
const baseName = 'layer-tree';

export interface LayerTreeProps {
  className?: string;
  style?: CSSProperties;
  type: DesignItemType;
}

export const LayerTree = (props: LayerTreeProps) => {
  const { className, style, type } = props;
  const { state } = useContext(Context);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  let treeData: DataNode[] = [];

  if (type === 'component') {
    treeData = parseComponentViewTree(state?.designData || null);
  }

  return (
    <div style={style} className={classnames(prefixName(baseName), className)}>
      <DirectoryTree showLine blockNode switcherIcon={<DownOutlined />} icon={null} defaultExpandedKeys={['0-0-0']} onSelect={onSelect} treeData={treeData} />
    </div>
  );
};
