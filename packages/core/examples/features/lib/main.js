import { getData } from './data/index.js';
import { doScale } from './scale.js';
import { doScroll } from './scroll.js';
import { doElemens } from './element.js';

const { Core } = window.iDrawCore;
const data = getData();
const mount = document.querySelector('#mount');

const defaultConf = {
  // scale: 1.5,
  // scrollLeft: 100,
  // scrollTop: 50,

  scale: 0,
  scrollLeft: 0,
  scrollTop: 0,
};
const core = new Core(mount, {
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 4,
  // onlyRender: true,
}, {
  scrollWrapper: {
    use: true,
    lineWidth: 16,
    color: '#9c27b0',
  },
  elementWrapper: {
    lockColor: '#009688',
    color: '#009688',
    controllerSize: 6,
    lineWidth: 1,
    // lineDash: [12, 12],
  },
});


// initEvent();

core.setData(data);

doScale(core, defaultConf.scale);
doScroll(core, defaultConf);
doElemens(core);



function initEvent() {
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
  core.on('screenClickElement', (data) => {
    console.log('screenClickElement: ', data);
  })
  core.on('mouseOverElement', (data) => {
    console.log('mouseOverElement: ', data);
  });
  core.on('mouseLeaveElement', (data) => {
    console.log('mouseLeaveElement: ', data);
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
  core.on('screenDoubleClickElement', (p) => {
    console.log('screenDoubleClickElement ===', p)
  })
  core.on('drawFrame', () => {
    console.log(' === drawFrame === ')
  })
  core.on('drawFrameComplete', () => {
    console.log(' === drawFrameComplete === ')
  })
  
}

