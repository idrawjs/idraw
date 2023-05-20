import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import { prefixName } from '../../css';
import './index.less';

const modName = 'mod-xxx';

export interface ModProps {
  className?: string;
  style?: CSSProperties;
}

export const Mod = (props: ModProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(`${modName}`), className)}>
      Mod
    </div>
  );
};
