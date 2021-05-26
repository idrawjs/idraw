import { getData } from './lib/data.js';
import { doScale } from './lib/scale.js';
import { doScroll } from './lib/scroll.js';

const { Core } = window.iDraw;

const data = getData();
const mount = document.querySelector('#mount');
const defaultConf = {
  scale: 0.5,
  scrollX: 100,
  scrollY: 200,
}
const core = new Core(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});
core.setData(data);
doScale(core, defaultConf.scale);
doScroll(core, defaultConf);

