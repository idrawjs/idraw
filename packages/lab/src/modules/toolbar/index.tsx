import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Radio from 'antd/es/radio';
import Button from 'antd/es/button';
import { createPrefixName } from '../../css';
import IconMouse from '../../icons/mouse';
import IconPen from '../../icons/pen';
import IconHand from '../../icons/hand';
import IconScale from '../../icons/scale';
import IconLayer from '../../icons/layer';
import IconSetting from '../../icons/setting';
import IconMore from '../../icons/more';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const modName = 'mod-toolbar';

const prefixName = createPrefixName(modName);

export interface ToolbarProps {
  className?: string;
  style?: CSSProperties;
  openLeftSider: boolean;
  openRightSider: boolean;
  onClickToggleLayer?: () => void;
  onClickToggleSetting?: () => void;
}

export const Toolbar = (props: ToolbarProps) => {
  const { className, style, openLeftSider, openRightSider, onClickToggleLayer, onClickToggleSetting } = props;
  const [mode, setMode] = useState<string>('select');
  const iconStyle = { fontSize: 20 };

  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <div className={prefixName('left')}>
        <Button shape="circle" type={openLeftSider ? 'primary' : 'default'} icon={<IconLayer style={iconStyle} />} onClick={onClickToggleLayer} />
      </div>
      <RadioGroup className={classnames(prefixName('middle'), prefixName('mode-switch'))} value={mode} onChange={(e) => setMode(e.target.value)}>
        <RadioButton value="select">
          <IconMouse style={iconStyle} />
        </RadioButton>
        <RadioButton value="pen">
          <IconPen style={iconStyle} />
        </RadioButton>
        <RadioButton value="hand">
          <IconHand style={iconStyle} />
        </RadioButton>
        <RadioButton value="scale">
          <IconScale style={iconStyle} />
        </RadioButton>
        <RadioButton value="more">
          <IconMore style={iconStyle} />
        </RadioButton>
      </RadioGroup>
      <div className={prefixName('right')}>
        <Button shape="circle" type={openRightSider ? 'primary' : 'default'} icon={<IconSetting style={iconStyle} />} onClick={onClickToggleSetting} />
      </div>
    </div>
  );
};
