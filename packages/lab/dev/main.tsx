import React from 'react';
import { createRoot } from 'react-dom/client';
import { Lab } from '../src/index';

const dom = document.querySelector('#lab') as HTMLDivElement;
const root = createRoot(dom);

root.render(<Lab />);
