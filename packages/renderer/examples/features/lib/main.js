import { getData } from './data/index.js';
 
const Renderer = window.iDrawRenderer;
const data = getData();
const canvas = document.querySelector('#canvas');


const renderer = new Renderer({
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 1,
  // devicePixelRatio: 2,
  // onlyRender: true,
});

renderer.on('drawFrame', (e) => {
  console.log('drawFrame =', e)
})
renderer.on('drawFrameComplete', (e) => {
  console.log('drawFrameComplete =', e)
})

renderer.render(canvas, data)
renderer.render(canvas, { elements: data.elements.splice(1, 2) }, { forceUpdate: false })

// setTimeout(() => {
  // renderer.render(canvas, { elements: data.elements.splice(1, 2) }, { forceUpdate: false })
// }, 2000);