import Core from './../src/index';
import { getData } from './data.js';

console.log('Core =', Core);

var opts = {
  width: 300,
  height: 200,
  contextWidth: 300,
  contextHeight: 200,
  devicePixelRatio: 4
};
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
    contextWidth: 500,
    contextHeight: 400
  }),
  {
    scrollWrapper: {
      use: true
    }
  }
);
core.setData(data);
