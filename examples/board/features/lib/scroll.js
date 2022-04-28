const inputX = document.querySelector('#scrollX');
const inputY = document.querySelector('#scrollY');
let hasInited = false;

export function doScroll(board, conf = {}) {
  if (hasInited === true)  return;
  if (!(inputX && inputY)) {
    return;
  }
  
  if (conf.scrollX >= 0 || conf.scrollX < 0) {
    inputX.value = conf.scrollX;
    const screen = board.scrollX(conf.scrollX);
    console.log('scrollX: screen =', screen);
    board.draw();
  }

  if (conf.scrollY >= 0 || conf.scrollY < 0) {
    inputY.value = conf.scrollY;
    const screen = board.scrollY(conf.scrollY);
    console.log('scrollY: screen =', screen);
    board.draw();
  }

  inputX.addEventListener('change', () => {
    const val = inputX.value * 1;
    if (val >= 0 || val < 0) {
      const screen = board.scrollX(val);
      console.log('scrollX: screen =', screen);
      board.draw();
    }
  });
  inputY.addEventListener('change', () => {
    const val = inputY.value * 1;
    if (val >= 0 || val < 0) {
      const screen = board.scrollY(val);
      console.log('scrollY: screen =', screen);
      board.draw();
    }
  });
  hasInited = true;
}