import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import classnames from 'classnames';
import Radio from 'antd/es/radio';
import { createPrefixName } from '../../css';
import './index.less';

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
  return (
    <div style={style} className={classnames(prefixName(), className)}>
      <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
        <RadioButton value="select">Select</RadioButton>
        <RadioButton value="pen">Pen</RadioButton>
        <RadioButton value="hand">Hand</RadioButton>
        <RadioButton value="scale">Scale</RadioButton>
      </Radio.Group>
    </div>
  );
};
