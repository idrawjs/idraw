import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { Toolbar } from '../toolbar';
import { PanelLayer } from '../panel-layer';
import { Header } from '../header';
import { Sketch } from '../sketch';
import type { CSSProperties } from 'react';
import { createPrefixName } from '../../css';
import { HEADER_HEIGHT } from './layout';
import SplitPane from '../split-pane';

const modName = 'mod-dashboard';
const leftSiderDefaultWidth = 240;
const rightSiderDefaultWidth = 200;

const prefixName = createPrefixName(modName);

export interface DashboardProps {
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
}

export const Dashboard = (props: DashboardProps) => {
  const { className, style, width, height } = props;

  const [openLeftSider, setOpenLeftSider] = useState<boolean>(true);
  const [openRightSider, setOpenRightSider] = useState<boolean>(false);

  const [leftWidth, setLeftWidth] = useState<number>(openLeftSider ? leftSiderDefaultWidth : 0);
  const [rightWidth, setRightWidth] = useState<number>(openRightSider ? rightSiderDefaultWidth : 0);
  const [centerWidth, setCenterWidth] = useState<number>(width - leftWidth - rightWidth);

  useEffect(() => {
    const prevWidth = leftWidth + centerWidth + rightWidth;
    let newLeftWidth = Math.floor(width * (leftWidth / prevWidth));
    let newRightWidth = Math.floor(width * (rightWidth / prevWidth));

    newLeftWidth = Math.min(newLeftWidth, leftSiderDefaultWidth);
    newRightWidth = Math.min(newRightWidth, rightSiderDefaultWidth);

    const newCenterWidth = width - newLeftWidth - newRightWidth;
    setLeftWidth(newLeftWidth);
    setRightWidth(newRightWidth);
    setCenterWidth(newCenterWidth);
  }, [height, width]);

  return (
    <div className={classnames(prefixName(), className)} style={{ ...style, ...{ width, height, padding: 0 } }}>
      <div className={prefixName('header')} style={{ height: HEADER_HEIGHT }}>
        <Header />
      </div>
      <div className={prefixName('content')} style={{ top: HEADER_HEIGHT }}>
        <SplitPane
          split="vertical"
          defaultSize={centerWidth + rightWidth}
          allowResize
          onChange={(px: number) => {
            setCenterWidth(px - rightWidth);
            setLeftWidth(width - px);
          }}
          pane1Style={{
            width: leftWidth
          }}
          pane2Style={{
            width: centerWidth + rightWidth
          }}
        >
          <div>
            <PanelLayer className={prefixName('left')} />
          </div>
          <div style={{ width: centerWidth + rightWidth, display: 'flex', flexDirection: 'row' }}>
            <Sketch className={prefixName('center')} width={centerWidth} height={height - HEADER_HEIGHT} />
            <div className={prefixName('right')} style={{ width: rightWidth, height: height - HEADER_HEIGHT }}>
              Right
            </div>
          </div>
        </SplitPane>
      </div>
      <Toolbar
        className={prefixName('toolbar-position')}
        openLeftSider={openLeftSider}
        openRightSider={openRightSider}
        onClickToggleLayer={() => {
          const open = openLeftSider ? false : true;

          let newLeftWidth = leftWidth;
          if (open) {
            newLeftWidth = leftSiderDefaultWidth;
          } else {
            newLeftWidth = 0;
          }
          setLeftWidth(newLeftWidth);
          setCenterWidth(width - newLeftWidth - rightWidth);
          setRightWidth(rightWidth);
          setOpenLeftSider(open);
        }}
        onClickToggleSetting={() => {
          const open = openRightSider ? false : true;
          let newRightWidth = rightWidth;
          if (open) {
            newRightWidth = rightSiderDefaultWidth;
          } else {
            newRightWidth = 0;
          }
          setLeftWidth(leftWidth);
          setCenterWidth(width - leftWidth - newRightWidth);
          setRightWidth(newRightWidth);
          setOpenRightSider(open);
        }}
      />
    </div>
  );
};
