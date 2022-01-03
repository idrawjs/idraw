// import util from '@idraw/util';
import Renderer from './../src/index';
import { getData } from './data.js';

const data = getData();

// const Context = util.Context;
const canvas = document.querySelector('#canvas');
const opts = {
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 1,
}

const renderer = new Renderer(opts);

renderer.on('load', (e) => {
  console.log('load =', e)
})
renderer.on('loadComplete', (e) => {
  console.log('loadComplete =', e)
})

renderer.on('drawFrame', (e) => {
  console.log('drawFrame =', e)
})
renderer.on('drawFrameComplete', (e) => {
  console.log('drawFrameComplete =', e)
})

// renderer.render(canvas, data)
// renderer.render(canvas, { elements: data.elements.splice(1, 2) }, { forceUpdate: false })
// console.log(renderer.getContext())


// canvas.width = opts.width * opts.devicePixelRatio;
// canvas.height = opts.height * opts.devicePixelRatio;
// const ctx = new Context(canvas.getContext('2d'), opts)
renderer.render(canvas, data);
renderer.render(canvas, { elements: data.elements.splice(1, 2) }, { forceUpdate: false })




