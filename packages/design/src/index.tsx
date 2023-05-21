import React, { useEffect, useState } from 'react';
import { Sketch } from './modules';
import './css/index.less';

export const Design = () => {
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(600);

  // const [width, setWidth] = useState<number>(window.innerWidth);
  // const [height, setHeight] = useState<number>(window.innerHeight);
  // useEffect(() => {
  //   window.addEventListener('resize', () => {
  //     const width = window.innerWidth;
  //     const height = window.innerHeight;
  //     setWidth(width);
  //     setHeight(height);
  //   });
  // }, []);

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, width, height }}>
      <Sketch width={width} height={height} />
    </div>
  );
};
