import React, { useEffect, useRef } from 'react';
import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { getData } from './data';

export const Lab = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref?.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio;
      const options = {
        width,
        height,
        devicePixelRatio,
        contextWidth: width,
        contextHeight: height
      };
      const core = new Core(ref.current, options);

      core.use(MiddlewareScroller);
      core.use(MiddlewareSelector);
      core.setData(getData());

      window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const devicePixelRatio = window.devicePixelRatio;
        core.resize({
          width,
          height,
          devicePixelRatio
        });
      });
    }
  }, []);
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, width: '100%', height: '100%' }}>
      <div ref={ref}></div>
    </div>
  );
};
