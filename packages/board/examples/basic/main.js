const { Board } = window.iDraw; 

const mount = document.querySelector('#mount');
const board = new Board(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});

const ctx = board.getContext();

ctx.setFillStyle('#f0f0f0');
ctx.fillRect(10, 10, 200, 120);

ctx.setFillStyle('#cccccc');
ctx.fillRect(80, 80, 200, 120);

ctx.setFillStyle('#c0c0c0');
ctx.fillRect(160, 160, 200, 120);

ctx.setFillStyle('#e0e0e0');
ctx.fillRect(400 - 10, 300 - 10, 200, 100);

board.draw();
