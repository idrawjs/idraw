import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Radio from 'antd/es/radio';
import { createPrefixName } from '../../css';
import IconMouse from '../../icons/mouse';
import IconPen from '../../icons/pen';
import IconHand from '../../icons/hand';
import IconScale from '../../icons/scale';

const RadioButton = Radio.Button;
const modName = 'mod-toolbar';

const prefixName = createPrefixName(modName);

export interface ToolbarProps {
  className?: string;
  style?: CSSProperties;
}

export const Toolbar = (props: ToolbarProps) => {
  const { className, style } = props;
  const [mode, setMode] = useState<string>('select');
  const iconStyle = { fontSize: 20 };
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <Radio.Group className={prefixName('mode-switch')} value={mode} onChange={(e) => setMode(e.target.value)}>
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
      </Radio.Group>
    </div>
  );
};
