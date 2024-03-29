import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Lab } from '../src/index';
import data from './data';

const dom = document.querySelector('#lab') as HTMLDivElement;
const root = createRoot(dom);

const App = () => {
  const style = { margin: 0, padding: 0 };
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerHeight);
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    });
  }, []);

  // const style = { margin: 40 };
  // const width = 800;
  // const height = 600;

  return <Lab width={width} height={height} style={style} labData={data} />;
};

root.render(<App />);
