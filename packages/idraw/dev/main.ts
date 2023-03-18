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
      // color: 'red'
      // showBackground: false
    }
  }
);
idraw.setData(data);

// const parseData = idraw.getData();

idraw.on('changeData', (d) => {
  console.log('changeData ======', d);
});

idraw.scale(1.5);

idraw.selectElementByIndex(1);

setTimeout(() => {
  // idraw.cancelElementByIndex(1);
  // idraw.cancelElement(parseData.elements[1].uuid);
}, 2000);

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
