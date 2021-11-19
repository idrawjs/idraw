import { getData } from './data/index.js';
// import util from './../../../node_modules/@idraw/util/dist/index.es.js'
// import util from './../../../../util/dist/index.es.js'
 
// const Context = util.Context;
const Context = iDrawUtil.Context;
const Renderer = window.iDrawRenderer;
const data = getData();
const canvas = document.querySelector('#canvas');
const opts = {
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 1,
  // devicePixelRatio: 2,
  // onlyRender: true,
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


canvas.width = opts.width * opts.devicePixelRatio;
canvas.height = opts.height * opts.devicePixelRatio;
const ctx = new Context(canvas.getContext('2d'), opts)
renderer.render(ctx, data);
renderer.render(ctx, { elements: data.elements.splice(1, 2) }, { forceUpdate: false })


