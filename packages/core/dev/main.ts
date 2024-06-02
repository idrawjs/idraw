import { Core, MiddlewareSelector, MiddlewareScroller, MiddlewareScaler, MiddlewareInfo, MiddlewareRuler } from '../src';

import data from './data';

const devicePixelRatio = window.devicePixelRatio;
// const width = window.innerWidth;
// const height = window.innerHeight;
const width = 600;
const height = 400;
const container = document.querySelector('#mount') as HTMLDivElement;

const core = new Core(container, {
  width,
  height,
  devicePixelRatio
});
core.use(MiddlewareSelector);
core.use(MiddlewareScroller);
core.use(MiddlewareScaler);
core.use(MiddlewareInfo);
core.use(MiddlewareRuler);
core.setData(data);
