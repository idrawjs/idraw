import React, { useEffect, useRef, useContext } from 'react';
import classnames from 'classnames';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import { createPrefixName } from '../../css';
import { Context } from '../../context';
import type { CSSProperties } from 'react';

const modName = 'mod-sketch';

const prefixName = createPrefixName(modName);

export interface DashboardProps {
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
}

export const Sketch = (props: DashboardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const refCore = useRef<Core | null>(null);
  const { className, style, width, height } = props;
  const devicePixelRatio = window.devicePixelRatio;

  const { state } = useContext(Context);

  useEffect(() => {
    if (ref?.current) {
      if (!refCore?.current) {
        const options = {
          width,
          height,
          devicePixelRatio
        };
        const core = new Core(ref.current, options);
        core.use(MiddlewareScroller);
        core.use(MiddlewareSelector);
        core.setData(state.viewDrawData);
        refCore.current = core;
      }
    }
  }, []);

  useEffect(() => {
    if (!refCore?.current) {
      return;
    }
    const core = refCore.current;
    const contextSize = calcElementsContextSize(state.viewDrawData.elements, { viewWidth: width, viewHeight: height, extend: true });
    core.resize({
      width,
      height,
      devicePixelRatio,
      ...contextSize
    });
  }, [height, width]);

  useEffect(() => {
    if (!refCore?.current || !state.viewDrawData) {
      return;
    }
    const core = refCore.current;
    core.setData(state.viewDrawData);
  }, [state.viewDrawData]);

  return <div ref={ref} className={classnames(prefixName(), className)} style={{ ...style, ...{ width, height, padding: 0 } }}></div>;
};
