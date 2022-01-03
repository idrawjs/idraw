import Core from './../src/index';
import data from './data';

console.log('Core =', Core)


const mount = document.querySelector('#mount');
const data = getData();
const core = new Core(
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
core.setData(data);
