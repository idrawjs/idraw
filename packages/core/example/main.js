// import data from './lib/data/rect.js';
import data from './lib/data/image.js';
// import data from './lib/data/svg.js';
import { doScale } from './lib/scale.js';
import { doScroll } from './lib/scroll.js';
import { doElemens } from './lib/element.js';

const { Core } = window.iDraw;

const mount = document.querySelector('#mount');
// const defaultConf = {
//   scale: 0.8,
//   scrollX: 100,
//   scrollY: 50,
// }

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

console.log('core ===', core);

core.setData(data);
doScale(core, defaultConf.scale);
doScroll(core, defaultConf);
doElemens(core);

