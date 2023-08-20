import React, { useContext } from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Switch from 'antd/es/switch';
import { createPrefixName } from '../../css';
import IconDark from '../../icons/dark';
import IconLight from '../../icons/light';
import { Context } from '../../context';
import { Toolbar } from '../toolbar';
import type { ToolbarProps } from '../toolbar';

const modName = 'mod-header';

const prefixName = createPrefixName(modName);

export interface ModProps extends ToolbarProps {
  className?: string;
  style?: CSSProperties;
}

export const Header = (props: ModProps) => {
  const { className, style, openLeftSider, openRightSider, onClickToggleLayer, onClickToggleSetting } = props;
  const { state, dispatch } = useContext(Context);

  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <span>@idraw/lab</span>
      <Toolbar
        openLeftSider={openLeftSider}
        openRightSider={openRightSider}
        onClickToggleLayer={onClickToggleLayer}
        onClickToggleSetting={onClickToggleSetting}
      />
      <Switch
        className={prefixName('theme', 'switch')}
        checkedChildren={<IconLight style={{ height: '100%' }} />}
        unCheckedChildren={<IconDark style={{ height: '100%' }} />}
        checked={state?.themeMode === 'light'}
        onChange={(checked: boolean) => {
          dispatch?.({
            type: 'updateThemeMode',
            payload: {
              themeMode: checked ? 'light' : 'dark'
            }
          });
        }}
      />
    </div>
  );
};
