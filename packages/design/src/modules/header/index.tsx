import React from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Switch from 'antd/es/switch';
import { createPrefixName } from '../../css';
import IconDark from '../../icons/dark';
import IconLight from '../../icons/light';

const modName = 'mod-header';

const prefixName = createPrefixName(modName);

export interface ModProps {
  className?: string;
  style?: CSSProperties;
}

export const Header = (props: ModProps) => {
  const { className, style } = props;
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <span>Header</span>
      <Switch
        className={prefixName('theme', 'switch')}
        checkedChildren={<IconLight style={{ height: '100%' }} />}
        unCheckedChildren={<IconDark style={{ height: '100%' }} />}
        defaultChecked
      />
    </div>
  );
};
