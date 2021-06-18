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
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 4,
}, {
  scrollWrapper: {
    use: true,
    lineWidth: 20,
  }
});


core.on('error', (data) => {
  console.log('error: ', data);
});
core.on('changeData', (data) => {
  console.log('changeData: ', data);
});
core.on('changeScreen', (data) => {
  console.log('changeScreen: ', data);
});
core.on('screenSelectElement', (data) => {
  console.log('screenSelectElement: ', data);
});
core.on('screenMoveElementStart', (data) => {
  console.log('screenMoveElementStart: ', data);
});
core.on('screenMoveElementEnd', (data) => {
  console.log('screenMoveElementEnd: ', data);
});
core.on('screenChangeElement', (data) => {
  console.log('screenChangeElement: ', data);
});


core.setData(data);
core.draw();

doScale(core, defaultConf.scale);
doScroll(core, defaultConf);
doElemens(core);

