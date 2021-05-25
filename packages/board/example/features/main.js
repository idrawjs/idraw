import { draw } from './lib/draw.js';
import { onScale } from './lib/scale.js';
import { onScroll } from './lib/scroll.js';

const { Board } = window.iDraw; 

const mount = document.querySelector('#mount');
const board = new Board(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});

draw(board);
onScale(board);
onScroll(board);

// board.scale(2);
// board.draw();