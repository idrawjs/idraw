import data from './data.js';
import { doScale } from './scale.js';
import { doScroll } from './scroll.js';
import { doElemens } from './element.js';
import { doAction } from './action.js'

const { IDraw } = window.iDraw;
const mount = document.querySelector('#mount');

const defaultConf = {
  scale: 1,
  scrollX: 0,
  scrollY: 0,
}
const idraw = new IDraw(mount, {
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 4
});


idraw.on('error', (data) => {
  console.log('error: ', data);
});
idraw.on('changeData', (data) => {
  console.log('changeData: ', data);
});
idraw.on('changeScreen', (data) => {
  console.log('changeScreen: ', data);
});
idraw.on('screenSelectElement', (data) => {
  console.log('screenSelectElement: ', data);
});
idraw.on('screenMoveElementStart', (data) => {
  console.log('screenMoveElementStart: ', data);
});
idraw.on('screenMoveElementEnd', (data) => {
  console.log('screenMoveElementEnd: ', data);
});
idraw.on('screenChangeElement', (data) => {
  console.log('screenChangeElement: ', data);
});


idraw.setData(data, {
  triggerChangeEvent: true,
});

doAction(idraw);
doScale(idraw, defaultConf.scale);
doScroll(idraw, defaultConf);
doElemens(idraw);

