import React, { useEffect, useRef } from 'react';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { calcElementsContextSize } from '@idraw/util';
import { getData } from './data';
import { Toolbar } from './modules';

export const Sketch = () => {
  const ref = useRef<HTMLDivElement>(null);
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
    <div style={{ position: 'fixed', left: 0, right: 0, width: '100%', height: '100%' }}>
      <div ref={ref}></div>
      <Toolbar />
    </div>
  );
};
