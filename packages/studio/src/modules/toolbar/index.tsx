import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import { prefixName } from '../../css';
import './index.less';

const modName = 'mod-toolbar';

export interface ToolbarProps {
  className?: string;
  style?: CSSProperties;
}

export const Toolbar = (props: ToolbarProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(`${modName}`), className)}>
      Toolbar
    </div>
  );
};
