import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import { getData } from '../../data';
import { Toolbar } from '../toolbar';
import type { CSSProperties } from 'react';
import { createPrefixName } from '../../css';
import './index.less';

const modName = 'mod-sketch';

const prefixName = createPrefixName(modName);

export interface SketchProps {
  className?: string;
  style?: CSSProperties;
}

export const Sketch = (props: SketchProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { className, style } = props;
  useEffect(() => {
    if (ref?.current) {
      const data = getData();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio;
      const options = {
        width,
        height,
        devicePixelRatio
      };
      const core = new Core(ref.current, options);

      core.use(MiddlewareScroller);
      core.use(MiddlewareSelector);
      core.setData(data);
      // core.scrollX(0);
      // core.scrollY(0);

      window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const devicePixelRatio = window.devicePixelRatio;
        const contextSize = calcElementsContextSize(data.elements, { viewWidth: width, viewHeight: height });
        core.resize({
          width,
          height,
          devicePixelRatio,
          ...contextSize
        });
      });
    }
  }, []);
  return (
    <div className={classnames(prefixName(), className)} style={style}>
      <div ref={ref}></div>
      <Toolbar className={prefixName('toolbar-position')} />
    </div>
  );
};
