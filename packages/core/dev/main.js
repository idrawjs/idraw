import { Core } from './../src/index';
import { getData } from './data.js';

var opts = {
  width: 600,
  height: 300,
  contextWidth: 400,
  contextHeight: 240,
  devicePixelRatio: 4,
}
// var config = {
//   elementWrapper: {
//     controllerSize: 4,
//   }
// }

const mount = document.querySelector('#mount');
const data = getData();
const core = new Core(
  mount,
  Object.assign({}, opts, {
    // contextWidth: 800,
    // contextHeight: 600,
  }),
  {
    scrollWrapper: {
      use: true,
    },
  }
);
core.setData(data);
const currentData = core.getData();
core.selectElement(currentData.elements[0].uuid)
