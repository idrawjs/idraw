import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import { createPrefixName } from '../../css';

const modName = 'mod-panel-layer';

const prefixName = createPrefixName(modName);

export interface PanelLayerProps {
  className?: string;
  style?: CSSProperties;
}

export const PanelLayer = (props: PanelLayerProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <div className={prefixName('header')}>header</div>
      <div className={prefixName('content')}>Panel Layer</div>
      <div className={prefixName('footer')}>footer</div>
    </div>
  );
};
