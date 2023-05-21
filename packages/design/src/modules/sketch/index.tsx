import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import Drawer from 'antd/es/drawer';
import { getData } from '../../data';
import { Toolbar } from '../toolbar';
import type { CSSProperties } from 'react';
import { createPrefixName } from '../../css';

const modName = 'mod-sketch';
const siderWidth = 200;

const prefixName = createPrefixName(modName);

export interface SketchProps {
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
}

export const Sketch = (props: SketchProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const refCore = useRef<Core | null>(null);
  const refLeftDOM = useRef<HTMLDivElement | null>(null);
  const { className, style, width, height } = props;
  const data = getData();
  const devicePixelRatio = window.devicePixelRatio;

  const [openLayer, setOpenLayer] = useState<boolean>(false);
  const [openSetting, setOpenSetting] = useState<boolean>(false);

  useEffect(() => {
    if (ref?.current) {
      const options = {
        width,
        height,
        devicePixelRatio
      };
      const core = new Core(ref.current, options);
      core.use(MiddlewareScroller);
      core.use(MiddlewareSelector);
      core.setData(data);
      refCore.current = core;
    }
  }, []);

  useEffect(() => {
    if (!refCore?.current) {
      return;
    }
    const core = refCore.current;

    const contextSize = calcElementsContextSize(data.elements, { viewWidth: width, viewHeight: height });
    core.resize({
      width,
      height,
      devicePixelRatio,
      ...contextSize
    });
  }, [height, width]);

  return (
    <div className={classnames(prefixName(), className)} style={style}>
      <div ref={ref}></div>
      <Toolbar
        className={prefixName('toolbar-position')}
        openLayer={openLayer}
        openSetting={openSetting}
        onClickToggleLayer={() => {
          setOpenLayer(openLayer ? false : true);
        }}
        onClickToggleSetting={() => {
          setOpenSetting(openSetting ? false : true);
        }}
      />
      <div ref={refLeftDOM}></div>
      <Drawer
        title="left Drawer"
        placement="left"
        onClose={() => {
          console.log('on close left');
          setOpenLayer(false);
        }}
        mask={false}
        open={openLayer}
        getContainer={() => {
          return refLeftDOM.current as HTMLDivElement;
        }}
        width={siderWidth}
        rootStyle={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
      <Drawer
        title="right Drawer"
        placement="right"
        onClose={() => {
          console.log('on close right');
          setOpenSetting(false);
        }}
        mask={false}
        open={openSetting}
        getContainer={() => {
          return refLeftDOM.current as HTMLDivElement;
        }}
        width={siderWidth}
        rootStyle={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </div>
  );
};
