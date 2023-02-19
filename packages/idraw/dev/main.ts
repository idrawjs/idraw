/* eslint-disable @typescript-eslint/ban-ts-comment */
import iDraw from '../src/index';
import { getData } from './data';

const opts = {
  width: 600,
  height: 400,
  contextWidth: 600,
  contextHeight: 400,
  devicePixelRatio: 2
};

// var config = {
//   elementWrapper: {
//     controllerSize: 4,
//   }
// }

const mount = document.querySelector('#mount') as HTMLDivElement;
const data = getData();
const idraw = new iDraw(
  mount,
  Object.assign({}, opts, {
    // contextWidth: 500,
    // contextHeight: 400
  }),
  {
    scrollWrapper: {
      use: true
    }
  }
);
idraw.setData(data);

idraw.on('changeData', (d) => {
  console.log('changeData ======', d);
});

const btn = document.querySelector('#btn') as HTMLButtonElement;
btn.addEventListener('click', () => {
  idraw
    .exportDataURL({ type: 'image/png' })
    .then((dataURL) => {
      const preview = document.querySelector('#preview') as HTMLDivElement;
      preview.innerHTML = `<img width="300" src="${dataURL}">`;
    })
    .catch((err) => {
      console.log(err);
    });
});
