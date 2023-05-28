import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import Drawer from 'antd/es/drawer';
import { getData } from '../../data';
import { Toolbar } from '../toolbar';
import { PanelLayer } from '../panel-layer';
import { Header } from '../header';
import type { CSSProperties } from 'react';
import { createPrefixName } from '../../css';
import { HEADER_HEIGHT } from './layout';

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
  const refRighttDOM = useRef<HTMLDivElement | null>(null);
  const { className, style, width, height } = props;
  const data = getData();
  const devicePixelRatio = window.devicePixelRatio;

  const [openLeftSider, setOpenLeftSider] = useState<boolean>(true);
  const [openRightSider, setOpenRightSider] = useState<boolean>(false);

  useEffect(() => {
    if (ref?.current) {
      if (!refCore?.current) {
        const options = {
          width,
          height: height - HEADER_HEIGHT,
          devicePixelRatio
        };
        const core = new Core(ref.current, options);
        core.use(MiddlewareScroller);
        core.use(MiddlewareSelector);
        core.setData(data);
        refCore.current = core;
      }
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
      height: height - HEADER_HEIGHT,
      devicePixelRatio,
      ...contextSize
    });
  }, [height, width]);

  return (
    <div className={classnames(prefixName(), className)} style={{ ...style, ...{ width, height, padding: 0 } }}>
      <div className={prefixName('header')} style={{ height: HEADER_HEIGHT }}>
        <Header />
      </div>
      <div ref={ref} className={prefixName('content')} style={{ top: HEADER_HEIGHT }}></div>
      <div ref={refLeftDOM}></div>
      <div ref={refRighttDOM}></div>
      <Toolbar
        className={prefixName('toolbar-position')}
        openLeftSider={openLeftSider}
        openRightSider={openRightSider}
        onClickToggleLayer={() => {
          setOpenLeftSider(openLeftSider ? false : true);
        }}
        onClickToggleSetting={() => {
          setOpenRightSider(openRightSider ? false : true);
        }}
      />
      <Drawer
        // title="left Drawer"
        placement="left"
        closable={false}
        onClose={() => {
          console.log('on close left');
          setOpenLeftSider(false);
        }}
        mask={false}
        open={openLeftSider}
        getContainer={() => {
          return refLeftDOM.current as HTMLDivElement;
        }}
        width={siderWidth}
        bodyStyle={{
          padding: 0
        }}
        rootStyle={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0
        }}
      >
        <PanelLayer />
      </Drawer>
      <Drawer
        title="right Drawer"
        placement="right"
        onClose={() => {
          console.log('on close right');
          setOpenRightSider(false);
        }}
        mask={false}
        open={openRightSider}
        getContainer={() => {
          return refRighttDOM.current as HTMLDivElement;
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
