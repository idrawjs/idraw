import opts from './lib/opts.js';
import { drawData } from './lib/draw.js';
import { doScale } from './lib/scale.js';
import { doScroll } from './lib/scroll.js';
import { initEvent } from './lib/event.js';

const { Board } = window.iDraw; 

const mount = document.querySelector('#mount');
const board = new Board(mount, opts);

// const conf = {
//   scale: 0.5,
//   scrollX: 100,
//   scrollY: 200,
// }

const conf = {
  scale: 0.5,
  scrollX: 0,
  scrollY: 0,
}

drawData(board);

initEvent(board);
doScale(board, conf.scale);
doScroll(board, conf);


// board.scale(2);
// board.draw();