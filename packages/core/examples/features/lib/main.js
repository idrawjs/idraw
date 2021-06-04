import { getData } from './data/index.js';
import { doScale } from './scale.js';
import { doScroll } from './scroll.js';
import { doElemens } from './element.js';

const { Core } = window.iDraw;
const data = getData();
const mount = document.querySelector('#mount');

const defaultConf = {
  scale: 1,
  scrollX: 0,
  scrollY: 0,
}
const core = new Core(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});


core.setData(data);
core.draw();

doScale(core, defaultConf.scale);
doScroll(core, defaultConf);
doElemens(core);

