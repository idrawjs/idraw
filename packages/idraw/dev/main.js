import iDraw from './../src/index';
import { getData } from './data.js';

var opts = {
  width: 300,
  height: 200,
  contextWidth: 300,
  contextHeight: 200,
  devicePixelRatio: 4,
};

// var config = {
//   elementWrapper: {
//     controllerSize: 4,
//   }
// }

const mount = document.querySelector('#mount');
const data = getData();
const idraw = new iDraw(
  mount,
  Object.assign({}, opts, {
    contextWidth: 500,
    contextHeight: 400,
  }),
  {
    scrollWrapper: {
      use: true,
    },
  }
);
idraw.setData(data);



const btn = document.querySelector('#btn');
btn.addEventListener('click', () => {
  idraw.exportDataURL({type: "image/png"}).then((dataURL) => {
    const preview = document.querySelector('#preview');
    preview.innerHTML = `<img width="300" src="${dataURL}">`;
  }).catch((err) => {
    console.log(err);
  });
});

