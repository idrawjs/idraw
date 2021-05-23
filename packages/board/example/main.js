const { Board } = window.iDraw; 

const mount = document.querySelector('#mount');
const board = new Board(mount, {
  width: 600,
  height: 400,
  devicePixelRatio: 4
});
board.render();