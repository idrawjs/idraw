import { Board } from './../src/esm';

function drawBoard(board) {
  const ctx = board.getContext();
  // ctx.setFillStyle('#ffffff');
  // ctx.fillRect(0, 0, 300, 200);

  ctx.setFillStyle('#f0f0f0');
  ctx.fillRect(5, 5, 100, 60);

  ctx.setFillStyle('#cccccc');
  ctx.fillRect(40, 40, 100, 60);

  ctx.setFillStyle('#c0c0c0');
  ctx.fillRect(80, 80, 100, 60);

  ctx.setFillStyle('#e0e0e0');
  ctx.fillRect(200 - 5, 150 - 5, 100, 50);

  ctx.setFillStyle('#000');
  ctx.fillRect(150 - 5, 100 - 5, 10, 10);
}

const mount = document.querySelector('#mount');
const opts = {
  width: 300,
  height: 200,
  contextWidth: 300,
  contextHeight: 200,
  devicePixelRatio: 4,
  canScroll: true,
}
const board = new Board(mount, opts); 
drawBoard(board);
board.draw();

board.resetSize({
  width: 270,
  height: 180,
  contextWidth: 400,
  contextHeight: 320,
  devicePixelRatio: 4,
});
drawBoard(board);
board.draw();