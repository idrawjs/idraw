import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import { createPrefixName } from '../../css';
import './index.less';

const modName = 'mod-sketch';

const prefixName = createPrefixName(modName);

export interface ModProps {
  className?: string;
  style?: CSSProperties;
}

export const Mod = (props: ModProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      Mod
    </div>
  );
};
