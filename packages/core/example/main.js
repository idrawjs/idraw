import { getData } from './lib/data.js';
const { Core } = window.iDraw;

const data = getData();
const mount = document.querySelector('#mount');
const core = new Core(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});
core.setData(data);
core.draw();