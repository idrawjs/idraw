import opts from './lib/opts.js';
import { drawData } from './lib/draw.js';
import { doScale } from './lib/scale.js';
import { doScroll } from './lib/scroll.js';
import { initEvent } from './lib/event.js';

const { Board } = window.iDraw; 

const mount = document.querySelector('#mount');
const board = new Board(mount, opts);

drawData(board);

initEvent(board);
doScale(board);
doScroll(board);


// board.scale(2);
// board.draw();