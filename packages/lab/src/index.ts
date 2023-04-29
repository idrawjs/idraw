import { Core, MiddlewareScroller, MiddlewareSelector } from '@idraw/core';
import { getData } from './data';

const body = document.querySelector('body');
const mount = document.createElement('div');
body?.appendChild(mount);
const width = window.innerWidth;
const height = window.innerHeight;

const options = {
  width,
  height,
  devicePixelRatio: window.devicePixelRatio,
  contextWidth: width,
  contextHeight: height
};
const core = new Core(mount, options);
core.use(MiddlewareScroller);
core.use(MiddlewareSelector);
core.setData(getData());
