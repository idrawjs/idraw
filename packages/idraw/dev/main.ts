/* eslint-disable @typescript-eslint/ban-ts-comment */
import { iDraw } from '../src/index';
import { getData } from './data';

const opts = {
  width: 800,
  height: 500,
  devicePixelRatio: 2,
  styles: {
    selector: {
      activeColor: 'red',
      activeAreaColor: '#FF00001C',
      lockedColor: 'black',
      referenceColor: 'green'
    },
    info: {
      textBackground: 'yellow',
      textColor: 'red'
    },
    ruler: {
      background: '#0000FF1A',
      borderColor: '#0000FF',
      scaleColor: '#FF0000',
      textColor: '#000000',
      gridColor: '#0000FF1C',
      gridPrimaryColor: '#0000FFAC',
      selectedAreaColor: '#FF0000CC'
    },
    scroller: {
      thumbBackground: '#FF00003A',
      thumbBorderColor: '#FF00008A',
      hoverThumbBackground: '#FF00006E',
      hoverThumbBorderColor: '#FF0000EE',
      activeThumbBackground: '#FF00005E',
      activeThumbBorderColor: '#FF0000F0'
    }
  }
};

const mount = document.querySelector('#mount') as HTMLDivElement;
const data = getData();
const idraw = new iDraw(mount, opts);
idraw.setData(data);
idraw.centerContent();
// idraw.scale(0.5);
// idraw.scale(2);
// idraw.scrollX(-80);
// idraw.scrollY(-80);

// const mount2 = document.querySelector('#mount') as HTMLDivElement;
// const data2 = getData();
// const idraw2 = new iDraw(
//   mount2,
//   Object.assign({}, opts, {
//     // contextWidth: 500,
//     // contextHeight: 400
//   })
// );
// idraw2.setData(data2);

// const parseData = idraw.getData();

// idraw.on('changeData', (d) => {
//   console.log('changeData ======', d);
// });

// idraw.scale(1.5);
// idraw.selectElementByIndex(1);

// setTimeout(() => {
//   // idraw.cancelElementByIndex(1);
//   // idraw.cancelElement(parseData.elements[1].uuid);
// }, 2000);

// const btn = document.querySelector('#btn') as HTMLButtonElement;
// btn.addEventListener('click', () => {
//   idraw
//     .exportDataURL({ type: 'image/png' })
//     .then((dataURL) => {
//       const preview = document.querySelector('#preview') as HTMLDivElement;
//       preview.innerHTML = `<img width="300" src="${dataURL}">`;
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });
